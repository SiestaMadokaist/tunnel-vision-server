import * as sqs from '@aws-sdk/client-sqs';
import { Consumer, SQSMessage } from 'sqs-consumer';
import { Memoizer } from '../../helper/Memoizer';
import EventEmitter from 'events';
import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';
import { IRequestMessage, IResponse } from './interface';
export interface IClientSQSHub {
	incoming: {
		channel: string;
		hostname: string;
	};
	outgoing: {
		channel: string;
		client: sqs.SQSClient;
	};
}

export interface IRespEmitter<O> extends EventEmitter {
	on(requestId: 'message', action: (resp: O) => void): this;
	emit(requestId: 'message', response: O): boolean;
}

export class ClientSQSHub {
	#memo = new Memoizer<{
		consumer: Consumer;
		started: boolean;
	}>();
	#publishCounter: number = 0;
	constructor(private props: IClientSQSHub) {}

	client(): sqs.SQSClient {
		return this.props.outgoing.client;
	}

	start(): boolean {
		return this.#memo.memoize('started', () => {
			const consumer = this.requestConsumer();
			consumer.start();
			return true;
		});
	}

	private request(): AxiosInstance {
		return axios.create({ baseURL: this.props.incoming.hostname, timeout: 30_000 });
	}

	async getResponse(request: IRequestMessage): Promise<IResponse> {
		delete request.headers['host'];
		const data = request.method.toUpperCase() === 'GET' ? undefined : request.body;
		const response = await this.request()
			.request({
				method: request.method,
				data,
				params: request.query,
				headers: request.headers as AxiosRequestHeaders,
				url: request.path
			})
			.catch((error: AxiosError) => {
				if (error.isAxiosError) {
					return error.response;
				}
				throw error;
			});
		return {
			data: response?.data,
			headers: response?.headers ?? {},
			statusCode: response?.status ?? 500,
			requestId: request.requestId
		};
	}

	protected publish(response: IResponse): string {
		const command = new sqs.SendMessageCommand({
			MessageBody: JSON.stringify({ ...response }),
			QueueUrl: this.props.outgoing.channel
		});
		const { channel } = this.props.outgoing;
		console.log(`${this.#publishCounter} ClientHub: publish ${response.requestId} to ${channel}`);
		this.client().send(command).catch(console.error);
		this.#publishCounter++;
		return response.requestId;
	}

	protected async handleMessage(message: SQSMessage): Promise<void> {
		const request: IRequestMessage = JSON.parse(message.Body ?? '{}');
		const response = await this.getResponse(request);
		this.publish(response);
	}

	private requestConsumer(): Consumer {
		return this.#memo.memoize('consumer', () => {
			return Consumer.create({
				queueUrl: this.props.incoming.channel,
				handleMessage: async (message) => this.handleMessage(message).catch(console.error)
			});
		});
	}
}
