export class Memoizer<Store> {
	private store: Partial<Store> = {};

	memoize<K extends keyof Store>(k: K, cb: () => Store[K]): Store[K] {
		const stored = this.store[k];
		if (typeof stored === 'undefined') {
			const result = cb();
			this.store[k] = result;
			return result;
		}
		return stored as Store[K];
	}
}
