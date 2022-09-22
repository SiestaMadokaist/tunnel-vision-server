export interface IHubMessage {
	requestId: string;
}

export interface IResponse extends IHubMessage {
	headers: Record<string, string>;
	data: unknown;
	statusCode: number;
}

export interface IRequest {
	headers: Record<string, string | string[] | undefined>;
	body: unknown;
	query: Record<string, string | string[] | undefined>;
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
}

export interface IRequestMessage extends IRequest, IHubMessage {}
