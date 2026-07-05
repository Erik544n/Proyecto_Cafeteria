import { NativeModules, Platform } from 'react-native';

const LAN_API_URL = 'http://192.168.0.105:8000';

const DEFAULT_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : LAN_API_URL;

function getDevServerBaseUrl() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const host = scriptURL?.match(/\/\/([^/:]+):/)?.[1];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return DEFAULT_BASE_URL;
  }

  return `http://${host}:8000`;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || LAN_API_URL || getDevServerBaseUrl();

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(`No se pudo conectar con la API en ${API_BASE_URL}. Revisa la red.`);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.detail || 'La API devolvio un error inesperado.';
    throw new Error(Array.isArray(detail) ? detail[0]?.msg : detail);
  }

  return data;
}

export function login(email, password) {
  const params = new URLSearchParams({ email, password });
  return request(`/auth/login?${params.toString()}`, { method: 'POST' });
}

export function getPedidos(token) {
  return request('/caja/pedidos', { token });
}

export function getPedido(token, pedidoId) {
  return request(`/caja/pedidos/${pedidoId}`, { token });
}

export function getProductos(token) {
  return request('/mesero/productos', { token });
}

export function procesarPago(token, payload) {
  return request('/caja/ventas', {
    token,
    method: 'POST',
    body: payload,
  });
}

export function cancelarPedido(token, pedidoId) {
  return request(`/caja/pedidos/${pedidoId}/cancelar`, {
    token,
    method: 'PATCH',
  });
}
