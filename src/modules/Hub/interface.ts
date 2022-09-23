export interface IHubMessage {
	requestId: `${number}-${number}`;
}

export interface IResponse extends IHubMessage {
	headers: Record<string, string>;
	body: unknown;
	statusCode: number;
	type: 'connect' | 'response';
}

export interface IRequest {
	headers: Record<string, string | string[] | undefined>;
	body: unknown;
	query: Record<string, string | string[] | undefined>;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
}

export interface IRequestMessage extends IRequest, IHubMessage {}
