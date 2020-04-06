export function createPick<T>(array: T[]): () => T {
	const { length } = array;

	return (): any => array[Math.floor(Math.random() * length)];
}
