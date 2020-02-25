export function createPick<T>(array: T[]): () => T {
	const { length } = array;

	return () => array[Math.floor(Math.random() * length)];
}
