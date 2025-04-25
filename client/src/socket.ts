// client/src/socket.ts
import { io } from 'socket.io-client';

export const socket = io('https://secure-chat-web.onrender.com', { autoConnect: false });
