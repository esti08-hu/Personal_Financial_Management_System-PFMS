// Polyfills for MSW v2 and Jest environment
// This file runs before any tests and provides necessary globals

// Polyfill fetch for Node.js environment
const { fetch, Request, Response, Headers } = require('cross-fetch');

// Set globals for MSW and tests
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Text encoding polyfills
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// URL polyfill for older Node.js versions
if (!global.URL) {
  global.URL = require('url').URL;
}

// Basic polyfills for web APIs
if (!global.Blob) {
  try {
    const { Blob } = require('buffer');
    global.Blob = Blob;
  } catch (e) {
    // Fallback if buffer.Blob is not available
    global.Blob = class Blob {};
  }
}

// Simple FormData polyfill
if (!global.FormData) {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    append(key, value) {
      this.data.set(key, value);
    }
    get(key) {
      return this.data.get(key);
    }
  };
}

// TransformStream polyfill
if (!global.TransformStream) {
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = {};
      this.writable = {};
    }
  };
}

// ReadableStream polyfill
if (!global.ReadableStream) {
  global.ReadableStream = class ReadableStream {
    constructor() {}
  };
}

// WritableStream polyfill
if (!global.WritableStream) {
  global.WritableStream = class WritableStream {
    constructor() {}
  };
}
