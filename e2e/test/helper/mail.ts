import axios, { Axios } from 'axios';
import { MAILHOG } from './urls';
import { decode as decodeQuotedPrintable } from 'libqp';

export interface Message {
	Content: {
		Headers: {
			From: Array<string>;
			To: Array<string>;
			Subject: Array<string>;
		};
	};
	ID: string;
	MIME: {
		Parts: Array<{
			Headers: Record<string, string>;
			Body: string;
		}>;
	};
}

export interface MessageDetail extends Message {
	Text: string;
	HTML: string;
}

export interface Messages {
	items: Array<Message>;
}

const TEXT_DECODER = new TextDecoder('utf-8');

export function quotedPrintableToString(encoded: string): string {
	return TEXT_DECODER.decode(decodeQuotedPrintable(encoded));
}

const MAILHOG_USER = 'admin';
const MAILHOG_PASSWORD = process.env.MAILHOG_PASSWORD;

export function getMailhogClient() {
	return new Axios({
		auth: { username: 'admin', password: process.env.MAILHOG_PASSWORD }
	});
}

export async function searchByEmailAndSubject(email: string, subject: string) {
	const messages = (
		await axios.get<Messages>(`${MAILHOG}api/v2/search`, {
			params: {
				kind: 'to',
				query: email
			},
			auth: {
				username: MAILHOG_USER,
				password: MAILHOG_PASSWORD
			},
			headers: {
				accept: 'application/json'
			}
		})
	).data;
	return messages.items.filter((m) => m.Content.Headers.Subject[0].includes(subject));
}
