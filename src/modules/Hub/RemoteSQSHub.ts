import * as sqs from '@aws-sdk/client-sqs';
import { Consumer, SQSMessage } from 'sqs-consumer';
import { Memoizer } from '../../helper/Memoizer';
import EventEmitter from 'events';
import assert from 'assert';
import { IRequest, IResponse } from './interface';
export interface ISQSHub {
	outgoing: {
		channel: string;
		client: sqs.SQSClient;
	};
	incoming: {
		channel: string;
	};
}

export interface IRespEmitter extends EventEmitter {
	on(requestId: string, action: (resp: IResponse) => void): this;
	emit(requestId: string, response: IResponse): boolean;
}

const RESPONSE_TIMEOUT = 5000;
export class RemoteSQSHub {
	#memo = new Memoizer<{
		consumer: Consumer;
		started: boolean;
	}>();
	#emitter: IRespEmitter = new EventEmitter();
	constructor(private props: ISQSHub) {}

	client(): sqs.SQSClient {
		return this.props.outgoing.client;
	}

	start(): boolean {
		return this.#memo.memoize('started', () => {
			const consumer = this.responseConsumer();
			consumer.start();
			return true;
		});
	}

	getResponse(request: IRequest): Promise<IResponse> {
		this.start();
		return new Promise((rs, rj) => {
			const t = setTimeout(() => {
				rj(new Error('timeout'));
			}, RESPONSE_TIMEOUT);
			this.publish(request, (resp) => {
				clearTimeout(t);
				rs(resp);
			});
		});
	}

	protected _publish(request: IRequest): string {
		const rng = Math.floor(Math.random() * Math.pow(10, 7));
		const requestId = `${Date.now()}-${rng}`;
		const command = new sqs.SendMessageCommand({
			MessageBody: JSON.stringify({ ...request, requestId }),
			QueueUrl: this.props.outgoing.channel
		});
		this.client().send(command).catch(console.error);
		console.log(`RemoteHub: publish to ${this.props.outgoing.channel}`);
		return requestId;
	}

	private publish(request: IRequest, resolve: (resp: IResponse) => void): string {
		const requestId = this._publish(request);
		this.#emitter.once(requestId, resolve);
		return requestId;
	}

	protected async handleMessage(message: SQSMessage): Promise<void> {
		const data: IResponse = JSON.parse(message.Body ?? '{}');
		assert.ok(data.requestId);
		this.#emitter.emit(data.requestId, data);
	}

	private responseConsumer(): Consumer {
		return this.#memo.memoize('consumer', () => {
			return Consumer.create({
				queueUrl: this.props.incoming.channel,
				handleMessage: async (message) => this.handleMessage(message).catch(console.error)
			});
		});
	}
}
