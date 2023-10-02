import { randomBytes } from 'crypto';

export const generateToken = () => {
	const secretLength = 16;
	const secret = randomBytes(secretLength).toString('hex');
	return secret;
}
