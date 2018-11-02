"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.Web3Shh = f();
  }
})(function () {
  var define, module, exports;return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
          }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];return o(n || r);
          }, p, p.exports, r, e, n, t);
        }return n[i].exports;
      }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
        o(t[i]);
      }return o;
    }return r;
  }()({ 1: [function (require, module, exports) {
      module.exports = require('./register')().Promise;
    }, { "./register": 3 }], 2: [function (require, module, exports) {
      "use strict";
      // global key for user preferred registration

      var REGISTRATION_KEY = '@@any-promise/REGISTRATION',

      // Prior registration (preferred or detected)
      registered = null;

      /**
       * Registers the given implementation.  An implementation must
       * be registered prior to any call to `require("any-promise")`,
       * typically on application load.
       *
       * If called with no arguments, will return registration in
       * following priority:
       *
       * For Node.js:
       *
       * 1. Previous registration
       * 2. global.Promise if node.js version >= 0.12
       * 3. Auto detected promise based on first sucessful require of
       *    known promise libraries. Note this is a last resort, as the
       *    loaded library is non-deterministic. node.js >= 0.12 will
       *    always use global.Promise over this priority list.
       * 4. Throws error.
       *
       * For Browser:
       *
       * 1. Previous registration
       * 2. window.Promise
       * 3. Throws error.
       *
       * Options:
       *
       * Promise: Desired Promise constructor
       * global: Boolean - Should the registration be cached in a global variable to
       * allow cross dependency/bundle registration?  (default true)
       */
      module.exports = function (root, loadImplementation) {
        return function register(implementation, opts) {
          implementation = implementation || null;
          opts = opts || {};
          // global registration unless explicitly  {global: false} in options (default true)
          var registerGlobal = opts.global !== false;

          // load any previous global registration
          if (registered === null && registerGlobal) {
            registered = root[REGISTRATION_KEY] || null;
          }

          if (registered !== null && implementation !== null && registered.implementation !== implementation) {
            // Throw error if attempting to redefine implementation
            throw new Error('any-promise already defined as "' + registered.implementation + '".  You can only register an implementation before the first ' + ' call to require("any-promise") and an implementation cannot be changed');
          }

          if (registered === null) {
            // use provided implementation
            if (implementation !== null && typeof opts.Promise !== 'undefined') {
              registered = {
                Promise: opts.Promise,
                implementation: implementation
              };
            } else {
              // require implementation if implementation is specified but not provided
              registered = loadImplementation(implementation);
            }

            if (registerGlobal) {
              // register preference globally in case multiple installations
              root[REGISTRATION_KEY] = registered;
            }
          }

          return registered;
        };
      };
    }, {}], 3: [function (require, module, exports) {
      "use strict";

      module.exports = require('./loader')(window, loadImplementation);

      /**
       * Browser specific loadImplementation.  Always uses `window.Promise`
       *
       * To register a custom implementation, must register with `Promise` option.
       */
      function loadImplementation() {
        if (typeof window.Promise === 'undefined') {
          throw new Error("any-promise browser requires a polyfill or explicit registration" + " e.g: require('any-promise/register/bluebird')");
        }
        return {
          Promise: window.Promise,
          implementation: 'window.Promise'
        };
      }
    }, { "./loader": 2 }], 4: [function (require, module, exports) {
      'use strict';

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;

      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      // Support decoding URL-safe base64 strings, as Node.js does.
      // See: https://en.wikipedia.org/wiki/Base64#URL_applications
      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;

      function getLens(b64) {
        var len = b64.length;

        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }

        // Trim off extra bytes after placeholder bytes are found
        // See: https://github.com/beatgammit/base64-js/issues/42
        var validLen = b64.indexOf('=');
        if (validLen === -1) validLen = len;

        var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;

        return [validLen, placeHoldersLen];
      }

      // base64 is 4/3 + up to two characters of the original data
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];

        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

        var curByte = 0;

        // if there are placeholders, only get up to the last complete 4 chars
        var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

        for (var i = 0; i < len; i += 4) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[curByte++] = tmp >> 16 & 0xFF;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        return arr;
      }

      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }

      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
          output.push(tripletToBase64(tmp));
        }
        return output.join('');
      }

      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
        var parts = [];
        var maxChunkLength = 16383; // must be multiple of 3

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }

        // pad the end with zeros, but make sure to not forget the extra bytes
        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
        }

        return parts.join('');
      }
    }, {}], 5: [function (require, module, exports) {}, {}], 6: [function (require, module, exports) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <https://feross.org>
       * @license  MIT
       */
      /* eslint-disable no-proto */

      'use strict';

      var base64 = require('base64-js');
      var ieee754 = require('ieee754');

      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;

      var K_MAX_LENGTH = 0x7fffffff;
      exports.kMaxLength = K_MAX_LENGTH;

      /**
       * If `Buffer.TYPED_ARRAY_SUPPORT`:
       *   === true    Use Uint8Array implementation (fastest)
       *   === false   Print warning and recommend using `buffer` v4.x which has an Object
       *               implementation (most compatible, even IE6)
       *
       * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
       * Opera 11.6+, iOS 4.2+.
       *
       * We report that the browser does not support typed arrays if the are not subclassable
       * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
       * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
       * for __proto__ and has a buggy typed array implementation.
       */
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
      }

      function typedArraySupport() {
        // Can typed array instances can be augmented?
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
              return 42;
            } };
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }

      Object.defineProperty(Buffer.prototype, 'parent', {
        enumerable: true,
        get: function get() {
          if (!Buffer.isBuffer(this)) return undefined;
          return this.buffer;
        }
      });

      Object.defineProperty(Buffer.prototype, 'offset', {
        enumerable: true,
        get: function get() {
          if (!Buffer.isBuffer(this)) return undefined;
          return this.byteOffset;
        }
      });

      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        // Return an augmented `Uint8Array` instance
        var buf = new Uint8Array(length);
        buf.__proto__ = Buffer.prototype;
        return buf;
      }

      /**
       * The Buffer constructor returns instances of `Uint8Array` that have their
       * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
       * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
       * and the `Uint8Array` methods. Square bracket notation works as expected -- it
       * returns a single octet.
       *
       * The `Uint8Array` prototype remains unmodified.
       */

      function Buffer(arg, encodingOrOffset, length) {
        // Common case.
        if (typeof arg === 'number') {
          if (typeof encodingOrOffset === 'string') {
            throw new TypeError('The "string" argument must be of type string. Received type number');
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }

      // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
      if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
        Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true,
          enumerable: false,
          writable: false
        });
      }

      Buffer.poolSize = 8192; // not used by this implementation

      function from(value, encodingOrOffset, length) {
        if (typeof value === 'string') {
          return fromString(value, encodingOrOffset);
        }

        if (ArrayBuffer.isView(value)) {
          return fromArrayLike(value);
        }

        if (value == null) {
          throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + (typeof value === "undefined" ? "undefined" : _typeof(value)));
        }

        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }

        if (typeof value === 'number') {
          throw new TypeError('The "value" argument must not be of type number. Received type number');
        }

        var valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer.from(valueOf, encodingOrOffset, length);
        }

        var b = fromObject(value);
        if (b) return b;

        if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
          return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
        }

        throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + (typeof value === "undefined" ? "undefined" : _typeof(value)));
      }

      /**
       * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
       * if value is a number.
       * Buffer.from(str[, encoding])
       * Buffer.from(array)
       * Buffer.from(buffer)
       * Buffer.from(arrayBuffer[, byteOffset[, length]])
       **/
      Buffer.from = function (value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };

      // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
      // https://github.com/feross/buffer/pull/148
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;

      function assertSize(size) {
        if (typeof size !== 'number') {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }

      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== undefined) {
          // Only pay attention to encoding if it's a string. This
          // prevents accidentally sending in a number that would
          // be interpretted as a start offset.
          return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }

      /**
       * Creates a new filled Buffer instance.
       * alloc(size[, fill[, encoding]])
       **/
      Buffer.alloc = function (size, fill, encoding) {
        return alloc(size, fill, encoding);
      };

      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }

      /**
       * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
       * */
      Buffer.allocUnsafe = function (size) {
        return allocUnsafe(size);
      };
      /**
       * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
       */
      Buffer.allocUnsafeSlow = function (size) {
        return allocUnsafe(size);
      };

      function fromString(string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') {
          encoding = 'utf8';
        }

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding);
        }

        var length = byteLength(string, encoding) | 0;
        var buf = createBuffer(length);

        var actual = buf.write(string, encoding);

        if (actual !== length) {
          // Writing a hex string, for example, that contains invalid characters will
          // cause everything after the first invalid character to be ignored. (e.g.
          // 'abxxcd' will be treated as 'ab')
          buf = buf.slice(0, actual);
        }

        return buf;
      }

      function fromArrayLike(array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        var buf = createBuffer(length);
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }

      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }

        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }

        var buf;
        if (byteOffset === undefined && length === undefined) {
          buf = new Uint8Array(array);
        } else if (length === undefined) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }

        // Return an augmented `Uint8Array` instance
        buf.__proto__ = Buffer.prototype;
        return buf;
      }

      function fromObject(obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0;
          var buf = createBuffer(len);

          if (buf.length === 0) {
            return buf;
          }

          obj.copy(buf, 0, 0, len);
          return buf;
        }

        if (obj.length !== undefined) {
          if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }

        if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }

      function checked(length) {
        // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
        // length is NaN (which is otherwise coerced to zero.)
        if (length >= K_MAX_LENGTH) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
        }
        return length | 0;
      }

      function SlowBuffer(length) {
        if (+length != length) {
          // eslint-disable-line eqeqeq
          length = 0;
        }
        return Buffer.alloc(+length);
      }

      Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
      };

      Buffer.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
        }

        if (a === b) return 0;

        var x = a.length;
        var y = b.length;

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'latin1':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true;
          default:
            return false;
        }
      };

      Buffer.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }

        if (list.length === 0) {
          return Buffer.alloc(0);
        }

        var i;
        if (length === undefined) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }

        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            buf = Buffer.from(buf);
          }
          if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };

      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== 'string') {
          throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + (typeof string === "undefined" ? "undefined" : _typeof(string)));
        }

        var len = string.length;
        var mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;

        // Use a for loop to avoid recursion
        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return len;
            case 'utf8':
            case 'utf-8':
              return utf8ToBytes(string).length;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2;
            case 'hex':
              return len >>> 1;
            case 'base64':
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
              }
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer.byteLength = byteLength;

      function slowToString(encoding, start, end) {
        var loweredCase = false;

        // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
        // property of a typed array.

        // This behaves neither like String nor Uint8Array in that we set start/end
        // to their upper/lower bounds if the value passed is out of range.
        // undefined is handled specially as per ECMA-262 6th Edition,
        // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
        if (start === undefined || start < 0) {
          start = 0;
        }
        // Return early if start > this.length. Done here to prevent potential uint32
        // coercion fail below.
        if (start > this.length) {
          return '';
        }

        if (end === undefined || end > this.length) {
          end = this.length;
        }

        if (end <= 0) {
          return '';
        }

        // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
        end >>>= 0;
        start >>>= 0;

        if (end <= start) {
          return '';
        }

        if (!encoding) encoding = 'utf8';

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end);

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end);

            case 'ascii':
              return asciiSlice(this, start, end);

            case 'latin1':
            case 'binary':
              return latin1Slice(this, start, end);

            case 'base64':
              return base64Slice(this, start, end);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = (encoding + '').toLowerCase();
              loweredCase = true;
          }
        }
      }

      // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
      // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
      // reliably in a browserify context because there could be multiple different
      // copies of the 'buffer' package in use. This method works even for Buffer
      // instances that were created from another copy of the `buffer` package.
      // See: https://github.com/feross/buffer/issues/154
      Buffer.prototype._isBuffer = true;

      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }

      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 16-bits');
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };

      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 32-bits');
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };

      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 64-bits');
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };

      Buffer.prototype.toString = function toString() {
        var length = this.length;
        if (length === 0) return '';
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };

      Buffer.prototype.toLocaleString = Buffer.prototype.toString;

      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
        if (this === b) return true;
        return Buffer.compare(this, b) === 0;
      };

      Buffer.prototype.inspect = function inspect() {
        var str = '';
        var max = exports.INSPECT_MAX_BYTES;
        str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
        if (this.length > max) str += ' ... ';
        return '<Buffer ' + str + '>';
      };

      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer.from(target, target.offset, target.byteLength);
        }
        if (!Buffer.isBuffer(target)) {
          throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + (typeof target === "undefined" ? "undefined" : _typeof(target)));
        }

        if (start === undefined) {
          start = 0;
        }
        if (end === undefined) {
          end = target ? target.length : 0;
        }
        if (thisStart === undefined) {
          thisStart = 0;
        }
        if (thisEnd === undefined) {
          thisEnd = this.length;
        }

        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError('out of range index');
        }

        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }

        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;

        if (this === target) return 0;

        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);

        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);

        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
      // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
      //
      // Arguments:
      // - buffer - a Buffer to search
      // - val - a string, Buffer, or number
      // - byteOffset - an index into `buffer`; will be clamped to an int32
      // - encoding - an optional encoding, relevant is val is a string
      // - dir - true for indexOf, false for lastIndexOf
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        // Empty buffer means no match
        if (buffer.length === 0) return -1;

        // Normalize byteOffset
        if (typeof byteOffset === 'string') {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 0x7fffffff) {
          byteOffset = 0x7fffffff;
        } else if (byteOffset < -0x80000000) {
          byteOffset = -0x80000000;
        }
        byteOffset = +byteOffset; // Coerce to Number.
        if (numberIsNaN(byteOffset)) {
          // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
          byteOffset = dir ? 0 : buffer.length - 1;
        }

        // Normalize byteOffset: negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;else return -1;
        }

        // Normalize val
        if (typeof val === 'string') {
          val = Buffer.from(val, encoding);
        }

        // Finally, search either indexOf (if dir is true) or lastIndexOf
        if (Buffer.isBuffer(val)) {
          // Special case: looking for empty string/buffer always fails
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === 'number') {
          val = val & 0xFF; // Search for a byte value [0-255]
          if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }

        throw new TypeError('val must be string, number or Buffer');
      }

      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;

        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase();
          if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }

        function read(buf, i) {
          if (indexSize === 1) {
            return buf[i];
          } else {
            return buf.readUInt16BE(i * indexSize);
          }
        }

        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }

        return -1;
      }

      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };

      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };

      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }

        var strLen = string.length;

        if (length > strLen / 2) {
          length = strLen / 2;
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }

      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
        // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8';
          length = this.length;
          offset = 0;
          // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset;
          length = this.length;
          offset = 0;
          // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined) encoding = 'utf8';
          } else {
            encoding = length;
            length = undefined;
          }
        } else {
          throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
        }

        var remaining = this.length - offset;
        if (length === undefined || length > remaining) length = remaining;

        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError('Attempt to write outside buffer bounds');
        }

        if (!encoding) encoding = 'utf8';

        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length);

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length);

            case 'ascii':
              return asciiWrite(this, string, offset, length);

            case 'latin1':
            case 'binary':
              return latin1Write(this, string, offset, length);

            case 'base64':
              // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };

      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];

        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }

          if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
          } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
          }

          res.push(codePoint);
          i += bytesPerSequence;
        }

        return decodeCodePointsArray(res);
      }

      // Based on http://stackoverflow.com/a/22747272/680742, the browser with
      // the lowest limit is Chrome, with 0x10000 args.
      // We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000;

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = '';
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        }
        return res;
      }

      function asciiSlice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 0x7F);
        }
        return ret;
      }

      function latin1Slice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }

      function hexSlice(buf, start, end) {
        var len = buf.length;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; ++i) {
          out += toHex(buf[i]);
        }
        return out;
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = '';
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === undefined ? len : ~~end;

        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }

        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }

        if (end < start) end = start;

        var newBuf = this.subarray(start, end);
        // Return an augmented `Uint8Array` instance
        newBuf.__proto__ = Buffer.prototype;
        return newBuf;
      };

      /*
       * Need to make sure that buffer isn't trying to write out of bounds.
       */
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }

        return val;
      };

      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length);
        }

        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 0x100)) {
          val += this[offset + --byteLength] * mul;
        }

        return val;
      };

      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };

      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };

      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };

      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
      };

      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };

      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 0x80)) return this[offset];
        return (0xff - this[offset] + 1) * -1;
      };

      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };

      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };

      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };

      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };

      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };

      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var mul = 1;
        var i = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
        this[offset] = value & 0xff;
        return offset + 1;
      };

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };

      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 0xff;
        return offset + 2;
      };

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 0xff;
        return offset + 4;
      };

      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 0xff;
        return offset + 4;
      };

      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
        if (value < 0) value = 0xff + value + 1;
        this[offset] = value & 0xff;
        return offset + 1;
      };

      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };

      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 0xff;
        return offset + 2;
      };

      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };

      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        if (value < 0) value = 0xffffffff + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 0xff;
        return offset + 4;
      };

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
        if (offset < 0) throw new RangeError('Index out of range');
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };

      // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;

        // Copy 0 bytes; we're done
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds');
        }
        if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
        if (end < 0) throw new RangeError('sourceEnd out of bounds');

        // Are we oob?
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }

        var len = end - start;

        if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
          // Use built-in when available, missing from IE11
          this.copyWithin(targetStart, start, end);
        } else if (this === target && start < targetStart && targetStart < end) {
          // descending copy from end
          for (var i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
        }

        return len;
      };

      // Usage:
      //    buffer.fill(number[, offset[, end]])
      //    buffer.fill(buffer[, offset[, end]])
      //    buffer.fill(string[, offset[, end]][, encoding])
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        // Handle string cases:
        if (typeof val === 'string') {
          if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
          }
          if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string');
          }
          if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
              // Fast path: If `val` fits into a single byte, use that numeric value.
              val = code;
            }
          }
        } else if (typeof val === 'number') {
          val = val & 255;
        }

        // Invalid ranges are not set to a default, so can range check early.
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError('Out of range index');
        }

        if (end <= start) {
          return this;
        }

        start = start >>> 0;
        end = end === undefined ? this.length : end >>> 0;

        if (!val) val = 0;

        var i;
        if (typeof val === 'number') {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
          var len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }

        return this;
      };

      // HELPER FUNCTIONS
      // ================

      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

      function base64clean(str) {
        // Node takes equal signs as end of the Base64 encoding
        str = str.split('=')[0];
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = str.trim().replace(INVALID_BASE64_RE, '');
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return '';
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '=';
        }
        return str;
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];

        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
              // no lead yet
              if (codePoint > 0xDBFF) {
                // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              } else if (i + 1 === length) {
                // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              }

              // valid lead
              leadSurrogate = codePoint;

              continue;
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              leadSurrogate = codePoint;
              continue;
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
          } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          }

          leadSurrogate = null;

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else {
            throw new Error('Invalid code point');
          }
        }

        return bytes;
      }

      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF);
        }
        return byteArray;
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;

          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }

        return byteArray;
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }

      // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
      // the `instanceof` check but they should be treated as of that type.
      // See: https://github.com/feross/buffer/issues/166
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        // For IE11 support
        return obj !== obj; // eslint-disable-line no-self-compare
      }
    }, { "base64-js": 4, "ieee754": 17 }], 7: [function (require, module, exports) {
      module.exports = {
        "100": "Continue",
        "101": "Switching Protocols",
        "102": "Processing",
        "200": "OK",
        "201": "Created",
        "202": "Accepted",
        "203": "Non-Authoritative Information",
        "204": "No Content",
        "205": "Reset Content",
        "206": "Partial Content",
        "207": "Multi-Status",
        "208": "Already Reported",
        "226": "IM Used",
        "300": "Multiple Choices",
        "301": "Moved Permanently",
        "302": "Found",
        "303": "See Other",
        "304": "Not Modified",
        "305": "Use Proxy",
        "307": "Temporary Redirect",
        "308": "Permanent Redirect",
        "400": "Bad Request",
        "401": "Unauthorized",
        "402": "Payment Required",
        "403": "Forbidden",
        "404": "Not Found",
        "405": "Method Not Allowed",
        "406": "Not Acceptable",
        "407": "Proxy Authentication Required",
        "408": "Request Timeout",
        "409": "Conflict",
        "410": "Gone",
        "411": "Length Required",
        "412": "Precondition Failed",
        "413": "Payload Too Large",
        "414": "URI Too Long",
        "415": "Unsupported Media Type",
        "416": "Range Not Satisfiable",
        "417": "Expectation Failed",
        "418": "I'm a teapot",
        "421": "Misdirected Request",
        "422": "Unprocessable Entity",
        "423": "Locked",
        "424": "Failed Dependency",
        "425": "Unordered Collection",
        "426": "Upgrade Required",
        "428": "Precondition Required",
        "429": "Too Many Requests",
        "431": "Request Header Fields Too Large",
        "451": "Unavailable For Legal Reasons",
        "500": "Internal Server Error",
        "501": "Not Implemented",
        "502": "Bad Gateway",
        "503": "Service Unavailable",
        "504": "Gateway Timeout",
        "505": "HTTP Version Not Supported",
        "506": "Variant Also Negotiates",
        "507": "Insufficient Storage",
        "508": "Loop Detected",
        "509": "Bandwidth Limit Exceeded",
        "510": "Not Extended",
        "511": "Network Authentication Required"
      };
    }, {}], 8: [function (require, module, exports) {
      /* jshint node: true */
      (function () {
        "use strict";

        function CookieAccessInfo(domain, path, secure, script) {
          if (this instanceof CookieAccessInfo) {
            this.domain = domain || undefined;
            this.path = path || "/";
            this.secure = !!secure;
            this.script = !!script;
            return this;
          }
          return new CookieAccessInfo(domain, path, secure, script);
        }
        CookieAccessInfo.All = Object.freeze(Object.create(null));
        exports.CookieAccessInfo = CookieAccessInfo;

        function Cookie(cookiestr, request_domain, request_path) {
          if (cookiestr instanceof Cookie) {
            return cookiestr;
          }
          if (this instanceof Cookie) {
            this.name = null;
            this.value = null;
            this.expiration_date = Infinity;
            this.path = String(request_path || "/");
            this.explicit_path = false;
            this.domain = request_domain || null;
            this.explicit_domain = false;
            this.secure = false; //how to define default?
            this.noscript = false; //httponly
            if (cookiestr) {
              this.parse(cookiestr, request_domain, request_path);
            }
            return this;
          }
          return new Cookie(cookiestr, request_domain, request_path);
        }
        exports.Cookie = Cookie;

        Cookie.prototype.toString = function toString() {
          var str = [this.name + "=" + this.value];
          if (this.expiration_date !== Infinity) {
            str.push("expires=" + new Date(this.expiration_date).toGMTString());
          }
          if (this.domain) {
            str.push("domain=" + this.domain);
          }
          if (this.path) {
            str.push("path=" + this.path);
          }
          if (this.secure) {
            str.push("secure");
          }
          if (this.noscript) {
            str.push("httponly");
          }
          return str.join("; ");
        };

        Cookie.prototype.toValueString = function toValueString() {
          return this.name + "=" + this.value;
        };

        var cookie_str_splitter = /[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;
        Cookie.prototype.parse = function parse(str, request_domain, request_path) {
          if (this instanceof Cookie) {
            var parts = str.split(";").filter(function (value) {
              return !!value;
            });
            var i;

            var pair = parts[0].match(/([^=]+)=([\s\S]*)/);
            if (!pair) {
              console.warn("Invalid cookie header encountered. Header: '" + str + "'");
              return;
            }

            var key = pair[1];
            var value = pair[2];
            if (typeof key !== 'string' || key.length === 0 || typeof value !== 'string') {
              console.warn("Unable to extract values from cookie header. Cookie: '" + str + "'");
              return;
            }

            this.name = key;
            this.value = value;

            for (i = 1; i < parts.length; i += 1) {
              pair = parts[i].match(/([^=]+)(?:=([\s\S]*))?/);
              key = pair[1].trim().toLowerCase();
              value = pair[2];
              switch (key) {
                case "httponly":
                  this.noscript = true;
                  break;
                case "expires":
                  this.expiration_date = value ? Number(Date.parse(value)) : Infinity;
                  break;
                case "path":
                  this.path = value ? value.trim() : "";
                  this.explicit_path = true;
                  break;
                case "domain":
                  this.domain = value ? value.trim() : "";
                  this.explicit_domain = !!this.domain;
                  break;
                case "secure":
                  this.secure = true;
                  break;
              }
            }

            if (!this.explicit_path) {
              this.path = request_path || "/";
            }
            if (!this.explicit_domain) {
              this.domain = request_domain;
            }

            return this;
          }
          return new Cookie().parse(str, request_domain, request_path);
        };

        Cookie.prototype.matches = function matches(access_info) {
          if (access_info === CookieAccessInfo.All) {
            return true;
          }
          if (this.noscript && access_info.script || this.secure && !access_info.secure || !this.collidesWith(access_info)) {
            return false;
          }
          return true;
        };

        Cookie.prototype.collidesWith = function collidesWith(access_info) {
          if (this.path && !access_info.path || this.domain && !access_info.domain) {
            return false;
          }
          if (this.path && access_info.path.indexOf(this.path) !== 0) {
            return false;
          }
          if (this.explicit_path && access_info.path.indexOf(this.path) !== 0) {
            return false;
          }
          var access_domain = access_info.domain && access_info.domain.replace(/^[\.]/, '');
          var cookie_domain = this.domain && this.domain.replace(/^[\.]/, '');
          if (cookie_domain === access_domain) {
            return true;
          }
          if (cookie_domain) {
            if (!this.explicit_domain) {
              return false; // we already checked if the domains were exactly the same
            }
            var wildcard = access_domain.indexOf(cookie_domain);
            if (wildcard === -1 || wildcard !== access_domain.length - cookie_domain.length) {
              return false;
            }
            return true;
          }
          return true;
        };

        function CookieJar() {
          var cookies, cookies_list, collidable_cookie;
          if (this instanceof CookieJar) {
            cookies = Object.create(null); //name: [Cookie]

            this.setCookie = function setCookie(cookie, request_domain, request_path) {
              var remove, i;
              cookie = new Cookie(cookie, request_domain, request_path);
              //Delete the cookie if the set is past the current time
              remove = cookie.expiration_date <= Date.now();
              if (cookies[cookie.name] !== undefined) {
                cookies_list = cookies[cookie.name];
                for (i = 0; i < cookies_list.length; i += 1) {
                  collidable_cookie = cookies_list[i];
                  if (collidable_cookie.collidesWith(cookie)) {
                    if (remove) {
                      cookies_list.splice(i, 1);
                      if (cookies_list.length === 0) {
                        delete cookies[cookie.name];
                      }
                      return false;
                    }
                    cookies_list[i] = cookie;
                    return cookie;
                  }
                }
                if (remove) {
                  return false;
                }
                cookies_list.push(cookie);
                return cookie;
              }
              if (remove) {
                return false;
              }
              cookies[cookie.name] = [cookie];
              return cookies[cookie.name];
            };
            //returns a cookie
            this.getCookie = function getCookie(cookie_name, access_info) {
              var cookie, i;
              cookies_list = cookies[cookie_name];
              if (!cookies_list) {
                return;
              }
              for (i = 0; i < cookies_list.length; i += 1) {
                cookie = cookies_list[i];
                if (cookie.expiration_date <= Date.now()) {
                  if (cookies_list.length === 0) {
                    delete cookies[cookie.name];
                  }
                  continue;
                }

                if (cookie.matches(access_info)) {
                  return cookie;
                }
              }
            };
            //returns a list of cookies
            this.getCookies = function getCookies(access_info) {
              var matches = [],
                  cookie_name,
                  cookie;
              for (cookie_name in cookies) {
                cookie = this.getCookie(cookie_name, access_info);
                if (cookie) {
                  matches.push(cookie);
                }
              }
              matches.toString = function toString() {
                return matches.join(":");
              };
              matches.toValueString = function toValueString() {
                return matches.map(function (c) {
                  return c.toValueString();
                }).join(';');
              };
              return matches;
            };

            return this;
          }
          return new CookieJar();
        }
        exports.CookieJar = CookieJar;

        //returns list of cookies that were set correctly. Cookies that are expired and removed are not returned.
        CookieJar.prototype.setCookies = function setCookies(cookies, request_domain, request_path) {
          cookies = Array.isArray(cookies) ? cookies : cookies.split(cookie_str_splitter);
          var successful = [],
              i,
              cookie;
          cookies = cookies.map(function (item) {
            return new Cookie(item, request_domain, request_path);
          });
          for (i = 0; i < cookies.length; i += 1) {
            cookie = cookies[i];
            if (this.setCookie(cookie, request_domain, request_path)) {
              successful.push(cookie);
            }
          }
          return successful;
        };
      })();
    }, {}], 9: [function (require, module, exports) {
      (function (Buffer) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.

        function isArray(arg) {
          if (Array.isArray) {
            return Array.isArray(arg);
          }
          return objectToString(arg) === '[object Array]';
        }
        exports.isArray = isArray;

        function isBoolean(arg) {
          return typeof arg === 'boolean';
        }
        exports.isBoolean = isBoolean;

        function isNull(arg) {
          return arg === null;
        }
        exports.isNull = isNull;

        function isNullOrUndefined(arg) {
          return arg == null;
        }
        exports.isNullOrUndefined = isNullOrUndefined;

        function isNumber(arg) {
          return typeof arg === 'number';
        }
        exports.isNumber = isNumber;

        function isString(arg) {
          return typeof arg === 'string';
        }
        exports.isString = isString;

        function isSymbol(arg) {
          return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'symbol';
        }
        exports.isSymbol = isSymbol;

        function isUndefined(arg) {
          return arg === void 0;
        }
        exports.isUndefined = isUndefined;

        function isRegExp(re) {
          return objectToString(re) === '[object RegExp]';
        }
        exports.isRegExp = isRegExp;

        function isObject(arg) {
          return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
        }
        exports.isObject = isObject;

        function isDate(d) {
          return objectToString(d) === '[object Date]';
        }
        exports.isDate = isDate;

        function isError(e) {
          return objectToString(e) === '[object Error]' || e instanceof Error;
        }
        exports.isError = isError;

        function isFunction(arg) {
          return typeof arg === 'function';
        }
        exports.isFunction = isFunction;

        function isPrimitive(arg) {
          return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'symbol' || // ES6 symbol
          typeof arg === 'undefined';
        }
        exports.isPrimitive = isPrimitive;

        exports.isBuffer = Buffer.isBuffer;

        function objectToString(o) {
          return Object.prototype.toString.call(o);
        }
      }).call(this, { "isBuffer": require("../../is-buffer/index.js") });
    }, { "../../is-buffer/index.js": 19 }], 10: [function (require, module, exports) {
      // This was ported from https://github.com/emn178/js-sha3, with some minor
      // modifications and pruning. It is licensed under MIT:
      //
      // Copyright 2015-2016 Chen, Yi-Cyuan
      //  
      // Permission is hereby granted, free of charge, to any person obtaining
      // a copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to
      // permit persons to whom the Software is furnished to do so, subject to
      // the following conditions:
      // 
      // The above copyright notice and this permission notice shall be
      // included in all copies or substantial portions of the Software.
      // 
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      // EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
      // LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
      // OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

      var HEX_CHARS = '0123456789abcdef'.split('');
      var KECCAK_PADDING = [1, 256, 65536, 16777216];
      var SHIFT = [0, 8, 16, 24];
      var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];

      var Keccak = function Keccak(bits) {
        return {
          blocks: [],
          reset: true,
          block: 0,
          start: 0,
          blockCount: 1600 - (bits << 1) >> 5,
          outputBlocks: bits >> 5,
          s: function (s) {
            return [].concat(s, s, s, s, s);
          }([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        };
      };

      var update = function update(state, message) {
        var length = message.length,
            blocks = state.blocks,
            byteCount = state.blockCount << 2,
            blockCount = state.blockCount,
            outputBlocks = state.outputBlocks,
            s = state.s,
            index = 0,
            i,
            code;

        // update
        while (index < length) {
          if (state.reset) {
            state.reset = false;
            blocks[0] = state.block;
            for (i = 1; i < blockCount + 1; ++i) {
              blocks[i] = 0;
            }
          }
          if (typeof message !== "string") {
            for (i = state.start; index < length && i < byteCount; ++index) {
              blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
            }
          } else {
            for (i = state.start; index < length && i < byteCount; ++index) {
              code = message.charCodeAt(index);
              if (code < 0x80) {
                blocks[i >> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 0x800) {
                blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              } else if (code < 0xd800 || code >= 0xe000) {
                blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              } else {
                code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
                blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              }
            }
          }
          state.lastByteIndex = i;
          if (i >= byteCount) {
            state.start = i - byteCount;
            state.block = blocks[blockCount];
            for (i = 0; i < blockCount; ++i) {
              s[i] ^= blocks[i];
            }
            f(s);
            state.reset = true;
          } else {
            state.start = i;
          }
        }

        // finalize
        i = state.lastByteIndex;
        blocks[i >> 2] |= KECCAK_PADDING[i & 3];
        if (state.lastByteIndex === byteCount) {
          blocks[0] = blocks[blockCount];
          for (i = 1; i < blockCount + 1; ++i) {
            blocks[i] = 0;
          }
        }
        blocks[blockCount - 1] |= 0x80000000;
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);

        // toString
        var hex = '',
            i = 0,
            j = 0,
            block;
        while (j < outputBlocks) {
          for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
            block = s[i];
            hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F] + HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F] + HEX_CHARS[block >> 28 & 0x0F] + HEX_CHARS[block >> 24 & 0x0F];
          }
          if (j % blockCount === 0) {
            f(s);
            i = 0;
          }
        }
        return "0x" + hex;
      };

      var f = function f(s) {
        var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;

        for (n = 0; n < 48; n += 2) {
          c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
          c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
          c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
          c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
          c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
          c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
          c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
          c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
          c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
          c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

          h = c8 ^ (c2 << 1 | c3 >>> 31);
          l = c9 ^ (c3 << 1 | c2 >>> 31);
          s[0] ^= h;
          s[1] ^= l;
          s[10] ^= h;
          s[11] ^= l;
          s[20] ^= h;
          s[21] ^= l;
          s[30] ^= h;
          s[31] ^= l;
          s[40] ^= h;
          s[41] ^= l;
          h = c0 ^ (c4 << 1 | c5 >>> 31);
          l = c1 ^ (c5 << 1 | c4 >>> 31);
          s[2] ^= h;
          s[3] ^= l;
          s[12] ^= h;
          s[13] ^= l;
          s[22] ^= h;
          s[23] ^= l;
          s[32] ^= h;
          s[33] ^= l;
          s[42] ^= h;
          s[43] ^= l;
          h = c2 ^ (c6 << 1 | c7 >>> 31);
          l = c3 ^ (c7 << 1 | c6 >>> 31);
          s[4] ^= h;
          s[5] ^= l;
          s[14] ^= h;
          s[15] ^= l;
          s[24] ^= h;
          s[25] ^= l;
          s[34] ^= h;
          s[35] ^= l;
          s[44] ^= h;
          s[45] ^= l;
          h = c4 ^ (c8 << 1 | c9 >>> 31);
          l = c5 ^ (c9 << 1 | c8 >>> 31);
          s[6] ^= h;
          s[7] ^= l;
          s[16] ^= h;
          s[17] ^= l;
          s[26] ^= h;
          s[27] ^= l;
          s[36] ^= h;
          s[37] ^= l;
          s[46] ^= h;
          s[47] ^= l;
          h = c6 ^ (c0 << 1 | c1 >>> 31);
          l = c7 ^ (c1 << 1 | c0 >>> 31);
          s[8] ^= h;
          s[9] ^= l;
          s[18] ^= h;
          s[19] ^= l;
          s[28] ^= h;
          s[29] ^= l;
          s[38] ^= h;
          s[39] ^= l;
          s[48] ^= h;
          s[49] ^= l;

          b0 = s[0];
          b1 = s[1];
          b32 = s[11] << 4 | s[10] >>> 28;
          b33 = s[10] << 4 | s[11] >>> 28;
          b14 = s[20] << 3 | s[21] >>> 29;
          b15 = s[21] << 3 | s[20] >>> 29;
          b46 = s[31] << 9 | s[30] >>> 23;
          b47 = s[30] << 9 | s[31] >>> 23;
          b28 = s[40] << 18 | s[41] >>> 14;
          b29 = s[41] << 18 | s[40] >>> 14;
          b20 = s[2] << 1 | s[3] >>> 31;
          b21 = s[3] << 1 | s[2] >>> 31;
          b2 = s[13] << 12 | s[12] >>> 20;
          b3 = s[12] << 12 | s[13] >>> 20;
          b34 = s[22] << 10 | s[23] >>> 22;
          b35 = s[23] << 10 | s[22] >>> 22;
          b16 = s[33] << 13 | s[32] >>> 19;
          b17 = s[32] << 13 | s[33] >>> 19;
          b48 = s[42] << 2 | s[43] >>> 30;
          b49 = s[43] << 2 | s[42] >>> 30;
          b40 = s[5] << 30 | s[4] >>> 2;
          b41 = s[4] << 30 | s[5] >>> 2;
          b22 = s[14] << 6 | s[15] >>> 26;
          b23 = s[15] << 6 | s[14] >>> 26;
          b4 = s[25] << 11 | s[24] >>> 21;
          b5 = s[24] << 11 | s[25] >>> 21;
          b36 = s[34] << 15 | s[35] >>> 17;
          b37 = s[35] << 15 | s[34] >>> 17;
          b18 = s[45] << 29 | s[44] >>> 3;
          b19 = s[44] << 29 | s[45] >>> 3;
          b10 = s[6] << 28 | s[7] >>> 4;
          b11 = s[7] << 28 | s[6] >>> 4;
          b42 = s[17] << 23 | s[16] >>> 9;
          b43 = s[16] << 23 | s[17] >>> 9;
          b24 = s[26] << 25 | s[27] >>> 7;
          b25 = s[27] << 25 | s[26] >>> 7;
          b6 = s[36] << 21 | s[37] >>> 11;
          b7 = s[37] << 21 | s[36] >>> 11;
          b38 = s[47] << 24 | s[46] >>> 8;
          b39 = s[46] << 24 | s[47] >>> 8;
          b30 = s[8] << 27 | s[9] >>> 5;
          b31 = s[9] << 27 | s[8] >>> 5;
          b12 = s[18] << 20 | s[19] >>> 12;
          b13 = s[19] << 20 | s[18] >>> 12;
          b44 = s[29] << 7 | s[28] >>> 25;
          b45 = s[28] << 7 | s[29] >>> 25;
          b26 = s[38] << 8 | s[39] >>> 24;
          b27 = s[39] << 8 | s[38] >>> 24;
          b8 = s[48] << 14 | s[49] >>> 18;
          b9 = s[49] << 14 | s[48] >>> 18;

          s[0] = b0 ^ ~b2 & b4;
          s[1] = b1 ^ ~b3 & b5;
          s[10] = b10 ^ ~b12 & b14;
          s[11] = b11 ^ ~b13 & b15;
          s[20] = b20 ^ ~b22 & b24;
          s[21] = b21 ^ ~b23 & b25;
          s[30] = b30 ^ ~b32 & b34;
          s[31] = b31 ^ ~b33 & b35;
          s[40] = b40 ^ ~b42 & b44;
          s[41] = b41 ^ ~b43 & b45;
          s[2] = b2 ^ ~b4 & b6;
          s[3] = b3 ^ ~b5 & b7;
          s[12] = b12 ^ ~b14 & b16;
          s[13] = b13 ^ ~b15 & b17;
          s[22] = b22 ^ ~b24 & b26;
          s[23] = b23 ^ ~b25 & b27;
          s[32] = b32 ^ ~b34 & b36;
          s[33] = b33 ^ ~b35 & b37;
          s[42] = b42 ^ ~b44 & b46;
          s[43] = b43 ^ ~b45 & b47;
          s[4] = b4 ^ ~b6 & b8;
          s[5] = b5 ^ ~b7 & b9;
          s[14] = b14 ^ ~b16 & b18;
          s[15] = b15 ^ ~b17 & b19;
          s[24] = b24 ^ ~b26 & b28;
          s[25] = b25 ^ ~b27 & b29;
          s[34] = b34 ^ ~b36 & b38;
          s[35] = b35 ^ ~b37 & b39;
          s[44] = b44 ^ ~b46 & b48;
          s[45] = b45 ^ ~b47 & b49;
          s[6] = b6 ^ ~b8 & b0;
          s[7] = b7 ^ ~b9 & b1;
          s[16] = b16 ^ ~b18 & b10;
          s[17] = b17 ^ ~b19 & b11;
          s[26] = b26 ^ ~b28 & b20;
          s[27] = b27 ^ ~b29 & b21;
          s[36] = b36 ^ ~b38 & b30;
          s[37] = b37 ^ ~b39 & b31;
          s[46] = b46 ^ ~b48 & b40;
          s[47] = b47 ^ ~b49 & b41;
          s[8] = b8 ^ ~b0 & b2;
          s[9] = b9 ^ ~b1 & b3;
          s[18] = b18 ^ ~b10 & b12;
          s[19] = b19 ^ ~b11 & b13;
          s[28] = b28 ^ ~b20 & b22;
          s[29] = b29 ^ ~b21 & b23;
          s[38] = b38 ^ ~b30 & b32;
          s[39] = b39 ^ ~b31 & b33;
          s[48] = b48 ^ ~b40 & b42;
          s[49] = b49 ^ ~b41 & b43;

          s[0] ^= RC[n];
          s[1] ^= RC[n + 1];
        }
      };

      var keccak = function keccak(bits) {
        return function (str) {
          var msg;
          if (str.slice(0, 2) === "0x") {
            msg = [];
            for (var i = 2, l = str.length; i < l; i += 2) {
              msg.push(parseInt(str.slice(i, i + 2), 16));
            }
          } else {
            msg = str;
          }
          return update(Keccak(bits, bits), msg);
        };
      };

      module.exports = {
        keccak256: keccak(256),
        keccak512: keccak(512),
        keccak256s: keccak(256),
        keccak512s: keccak(512)
      };
    }, {}], 11: [function (require, module, exports) {
      'use strict';

      var BN = require('bn.js');
      var numberToBN = require('number-to-bn');

      var zero = new BN(0);
      var negative1 = new BN(-1);

      // complete ethereum unit map
      var unitMap = {
        'noether': '0', // eslint-disable-line
        'wei': '1', // eslint-disable-line
        'kwei': '1000', // eslint-disable-line
        'Kwei': '1000', // eslint-disable-line
        'babbage': '1000', // eslint-disable-line
        'femtoether': '1000', // eslint-disable-line
        'mwei': '1000000', // eslint-disable-line
        'Mwei': '1000000', // eslint-disable-line
        'lovelace': '1000000', // eslint-disable-line
        'picoether': '1000000', // eslint-disable-line
        'gwei': '1000000000', // eslint-disable-line
        'Gwei': '1000000000', // eslint-disable-line
        'shannon': '1000000000', // eslint-disable-line
        'nanoether': '1000000000', // eslint-disable-line
        'nano': '1000000000', // eslint-disable-line
        'szabo': '1000000000000', // eslint-disable-line
        'microether': '1000000000000', // eslint-disable-line
        'micro': '1000000000000', // eslint-disable-line
        'finney': '1000000000000000', // eslint-disable-line
        'milliether': '1000000000000000', // eslint-disable-line
        'milli': '1000000000000000', // eslint-disable-line
        'ether': '1000000000000000000', // eslint-disable-line
        'kether': '1000000000000000000000', // eslint-disable-line
        'grand': '1000000000000000000000', // eslint-disable-line
        'mether': '1000000000000000000000000', // eslint-disable-line
        'gether': '1000000000000000000000000000', // eslint-disable-line
        'tether': '1000000000000000000000000000000' };

      /**
       * Returns value of unit in Wei
       *
       * @method getValueOfUnit
       * @param {String} unit the unit to convert to, default ether
       * @returns {BigNumber} value of the unit (in Wei)
       * @throws error if the unit is not correct:w
       */
      function getValueOfUnit(unitInput) {
        var unit = unitInput ? unitInput.toLowerCase() : 'ether';
        var unitValue = unitMap[unit]; // eslint-disable-line

        if (typeof unitValue !== 'string') {
          throw new Error('[ethjs-unit] the unit provided ' + unitInput + ' doesn\'t exists, please use the one of the following units ' + JSON.stringify(unitMap, null, 2));
        }

        return new BN(unitValue, 10);
      }

      function numberToString(arg) {
        if (typeof arg === 'string') {
          if (!arg.match(/^-?[0-9.]+$/)) {
            throw new Error('while converting number to string, invalid number value \'' + arg + '\', should be a number matching (^-?[0-9.]+).');
          }
          return arg;
        } else if (typeof arg === 'number') {
          return String(arg);
        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg.toString && (arg.toTwos || arg.dividedToIntegerBy)) {
          if (arg.toPrecision) {
            return String(arg.toPrecision());
          } else {
            // eslint-disable-line
            return arg.toString(10);
          }
        }
        throw new Error('while converting number to string, invalid number value \'' + arg + '\' type ' + (typeof arg === "undefined" ? "undefined" : _typeof(arg)) + '.');
      }

      function fromWei(weiInput, unit, optionsInput) {
        var wei = numberToBN(weiInput); // eslint-disable-line
        var negative = wei.lt(zero); // eslint-disable-line
        var base = getValueOfUnit(unit);
        var baseLength = unitMap[unit].length - 1 || 1;
        var options = optionsInput || {};

        if (negative) {
          wei = wei.mul(negative1);
        }

        var fraction = wei.mod(base).toString(10); // eslint-disable-line

        while (fraction.length < baseLength) {
          fraction = '0' + fraction;
        }

        if (!options.pad) {
          fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
        }

        var whole = wei.div(base).toString(10); // eslint-disable-line

        if (options.commify) {
          whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        var value = '' + whole + (fraction == '0' ? '' : '.' + fraction); // eslint-disable-line

        if (negative) {
          value = '-' + value;
        }

        return value;
      }

      function toWei(etherInput, unit) {
        var ether = numberToString(etherInput); // eslint-disable-line
        var base = getValueOfUnit(unit);
        var baseLength = unitMap[unit].length - 1 || 1;

        // Is it negative?
        var negative = ether.substring(0, 1) === '-'; // eslint-disable-line
        if (negative) {
          ether = ether.substring(1);
        }

        if (ether === '.') {
          throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, invalid value');
        }

        // Split it into a whole and fractional part
        var comps = ether.split('.'); // eslint-disable-line
        if (comps.length > 2) {
          throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei,  too many decimal points');
        }

        var whole = comps[0],
            fraction = comps[1]; // eslint-disable-line

        if (!whole) {
          whole = '0';
        }
        if (!fraction) {
          fraction = '0';
        }
        if (fraction.length > baseLength) {
          throw new Error('[ethjs-unit] while converting number ' + etherInput + ' to wei, too many decimal places');
        }

        while (fraction.length < baseLength) {
          fraction += '0';
        }

        whole = new BN(whole);
        fraction = new BN(fraction);
        var wei = whole.mul(base).add(fraction); // eslint-disable-line

        if (negative) {
          wei = wei.mul(negative1);
        }

        return new BN(wei.toString(10), 10);
      }

      module.exports = {
        unitMap: unitMap,
        numberToString: numberToString,
        getValueOfUnit: getValueOfUnit,
        fromWei: fromWei,
        toWei: toWei
      };
    }, { "bn.js": 12, "number-to-bn": 13 }], 12: [function (require, module, exports) {
      (function (module, exports) {
        'use strict';

        // Utils

        function assert(val, msg) {
          if (!val) throw new Error(msg || 'Assertion failed');
        }

        // Could use `inherits` module, but don't want to move from single file
        // architecture yet.
        function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function TempCtor() {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }

        // BN

        function BN(number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }

          this.negative = 0;
          this.words = null;
          this.length = 0;

          // Reduction context
          this.red = null;

          if (number !== null) {
            if (base === 'le' || base === 'be') {
              endian = base;
              base = 10;
            }

            this._init(number || 0, base || 10, endian || 'be');
          }
        }
        if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
          module.exports = BN;
        } else {
          exports.BN = BN;
        }

        BN.BN = BN;
        BN.wordSize = 26;

        var Buffer;
        try {
          Buffer = require('buf' + 'fer').Buffer;
        } catch (e) {}

        BN.isBN = function isBN(num) {
          if (num instanceof BN) {
            return true;
          }

          return num !== null && (typeof num === "undefined" ? "undefined" : _typeof(num)) === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };

        BN.max = function max(left, right) {
          if (left.cmp(right) > 0) return left;
          return right;
        };

        BN.min = function min(left, right) {
          if (left.cmp(right) < 0) return left;
          return right;
        };

        BN.prototype._init = function init(number, base, endian) {
          if (typeof number === 'number') {
            return this._initNumber(number, base, endian);
          }

          if ((typeof number === "undefined" ? "undefined" : _typeof(number)) === 'object') {
            return this._initArray(number, base, endian);
          }

          if (base === 'hex') {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);

          number = number.toString().replace(/\s+/g, '');
          var start = 0;
          if (number[0] === '-') {
            start++;
          }

          if (base === 16) {
            this._parseHex(number, start);
          } else {
            this._parseBase(number, base, start);
          }

          if (number[0] === '-') {
            this.negative = 1;
          }

          this.strip();

          if (endian !== 'le') return;

          this._initArray(this.toArray(), base, endian);
        };

        BN.prototype._initNumber = function _initNumber(number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 0x4000000) {
            this.words = [number & 0x3ffffff];
            this.length = 1;
          } else if (number < 0x10000000000000) {
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
            this.length = 2;
          } else {
            assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
            this.length = 3;
          }

          if (endian !== 'le') return;

          // Reverse the bytes
          this._initArray(this.toArray(), base, endian);
        };

        BN.prototype._initArray = function _initArray(number, base, endian) {
          // Perhaps a Uint8Array
          assert(typeof number.length === 'number');
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }

          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          var j, w;
          var off = 0;
          if (endian === 'be') {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === 'le') {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this.strip();
        };

        function parseHex(str, start, end) {
          var r = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;

            r <<= 4;

            // 'a' - 'f'
            if (c >= 49 && c <= 54) {
              r |= c - 49 + 0xa;

              // 'A' - 'F'
            } else if (c >= 17 && c <= 22) {
              r |= c - 17 + 0xa;

              // '0' - '9'
            } else {
              r |= c & 0xf;
            }
          }
          return r;
        }

        BN.prototype._parseHex = function _parseHex(number, start) {
          // Create possibly bigger array to ensure that it fits the number
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          var j, w;
          // Scan 24-bit chunks and add them to the number
          var off = 0;
          for (i = number.length - 6, j = 0; i >= start; i -= 6) {
            w = parseHex(number, i, i + 6);
            this.words[j] |= w << off & 0x3ffffff;
            // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
          if (i + 6 !== start) {
            w = parseHex(number, start, i + 6);
            this.words[j] |= w << off & 0x3ffffff;
            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
          }
          this.strip();
        };

        function parseBase(str, start, end, mul) {
          var r = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;

            r *= mul;

            // 'a'
            if (c >= 49) {
              r += c - 49 + 0xa;

              // 'A'
            } else if (c >= 17) {
              r += c - 17 + 0xa;

              // '0' - '9'
            } else {
              r += c;
            }
          }
          return r;
        }

        BN.prototype._parseBase = function _parseBase(number, base, start) {
          // Initialize as zero
          this.words = [0];
          this.length = 1;

          // Find length of limb in base
          for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = limbPow / base | 0;

          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;

          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);

            this.imuln(limbPow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }

          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);

            for (i = 0; i < mod; i++) {
              pow *= base;
            }

            this.imuln(pow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
        };

        BN.prototype.copy = function copy(dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };

        BN.prototype.clone = function clone() {
          var r = new BN(null);
          this.copy(r);
          return r;
        };

        BN.prototype._expand = function _expand(size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };

        // Remove leading `0` from `this`
        BN.prototype.strip = function strip() {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };

        BN.prototype._normSign = function _normSign() {
          // -0 = 0
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };

        BN.prototype.inspect = function inspect() {
          return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
        };

        /*
         var zeros = [];
        var groupSizes = [];
        var groupBases = [];
         var s = '';
        var i = -1;
        while (++i < BN.wordSize) {
          zeros[i] = s;
          s += '0';
        }
        groupSizes[0] = 0;
        groupSizes[1] = 0;
        groupBases[0] = 0;
        groupBases[1] = 0;
        var base = 2 - 1;
        while (++base < 36 + 1) {
          var groupSize = 0;
          var groupBase = 1;
          while (groupBase < (1 << BN.wordSize) / base) {
            groupBase *= base;
            groupSize += 1;
          }
          groupSizes[base] = groupSize;
          groupBases[base] = groupBase;
        }
         */

        var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];

        var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

        var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

        BN.prototype.toString = function toString(base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;

          var out;
          if (base === 16 || base === 'hex') {
            out = '';
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = ((w << off | carry) & 0xffffff).toString(16);
              carry = w >>> 24 - off & 0xffffff;
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          if (base === (base | 0) && base >= 2 && base <= 36) {
            // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
            var groupSize = groupSizes[base];
            // var groupBase = Math.pow(base, groupSize);
            var groupBase = groupBases[base];
            out = '';
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modn(groupBase).toString(base);
              c = c.idivn(groupBase);

              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = '0' + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          assert(false, 'Base should be between 2 and 36');
        };

        BN.prototype.toNumber = function toNumber() {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 0x4000000;
          } else if (this.length === 3 && this.words[2] === 0x01) {
            // NOTE: at this stage it is known that the top bit is set
            ret += 0x10000000000000 + this.words[1] * 0x4000000;
          } else if (this.length > 2) {
            assert(false, 'Number can only safely store up to 53 bits');
          }
          return this.negative !== 0 ? -ret : ret;
        };

        BN.prototype.toJSON = function toJSON() {
          return this.toString(16);
        };

        BN.prototype.toBuffer = function toBuffer(endian, length) {
          assert(typeof Buffer !== 'undefined');
          return this.toArrayLike(Buffer, endian, length);
        };

        BN.prototype.toArray = function toArray(endian, length) {
          return this.toArrayLike(Array, endian, length);
        };

        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, 'byte array longer than desired length');
          assert(reqLength > 0, 'Requested array length <= 0');

          this.strip();
          var littleEndian = endian === 'le';
          var res = new ArrayType(reqLength);

          var b, i;
          var q = this.clone();
          if (!littleEndian) {
            // Assume big-endian
            for (i = 0; i < reqLength - byteLength; i++) {
              res[i] = 0;
            }

            for (i = 0; !q.isZero(); i++) {
              b = q.andln(0xff);
              q.iushrn(8);

              res[reqLength - i - 1] = b;
            }
          } else {
            for (i = 0; !q.isZero(); i++) {
              b = q.andln(0xff);
              q.iushrn(8);

              res[i] = b;
            }

            for (; i < reqLength; i++) {
              res[i] = 0;
            }
          }

          return res;
        };

        if (Math.clz32) {
          BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 0x1000) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 0x40) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 0x8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 0x02) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }

        BN.prototype._zeroBits = function _zeroBits(w) {
          // Short-cut
          if (w === 0) return 26;

          var t = w;
          var r = 0;
          if ((t & 0x1fff) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 0x7f) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 0xf) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 0x3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 0x1) === 0) {
            r++;
          }
          return r;
        };

        // Return number of used bits in a BN
        BN.prototype.bitLength = function bitLength() {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };

        function toBitArray(num) {
          var w = new Array(num.bitLength());

          for (var bit = 0; bit < w.length; bit++) {
            var off = bit / 26 | 0;
            var wbit = bit % 26;

            w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
          }

          return w;
        }

        // Number of trailing zero bits
        BN.prototype.zeroBits = function zeroBits() {
          if (this.isZero()) return 0;

          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26) break;
          }
          return r;
        };

        BN.prototype.byteLength = function byteLength() {
          return Math.ceil(this.bitLength() / 8);
        };

        BN.prototype.toTwos = function toTwos(width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };

        BN.prototype.fromTwos = function fromTwos(width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };

        BN.prototype.isNeg = function isNeg() {
          return this.negative !== 0;
        };

        // Return negative clone of `this`
        BN.prototype.neg = function neg() {
          return this.clone().ineg();
        };

        BN.prototype.ineg = function ineg() {
          if (!this.isZero()) {
            this.negative ^= 1;
          }

          return this;
        };

        // Or `num` with `this` in-place
        BN.prototype.iuor = function iuor(num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }

          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }

          return this.strip();
        };

        BN.prototype.ior = function ior(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };

        // Or `num` with `this`
        BN.prototype.or = function or(num) {
          if (this.length > num.length) return this.clone().ior(num);
          return num.clone().ior(this);
        };

        BN.prototype.uor = function uor(num) {
          if (this.length > num.length) return this.clone().iuor(num);
          return num.clone().iuor(this);
        };

        // And `num` with `this` in-place
        BN.prototype.iuand = function iuand(num) {
          // b = min-length(num, this)
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }

          this.length = b.length;

          return this.strip();
        };

        BN.prototype.iand = function iand(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };

        // And `num` with `this`
        BN.prototype.and = function and(num) {
          if (this.length > num.length) return this.clone().iand(num);
          return num.clone().iand(this);
        };

        BN.prototype.uand = function uand(num) {
          if (this.length > num.length) return this.clone().iuand(num);
          return num.clone().iuand(this);
        };

        // Xor `num` with `this` in-place
        BN.prototype.iuxor = function iuxor(num) {
          // a.length > b.length
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }

          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = a.length;

          return this.strip();
        };

        BN.prototype.ixor = function ixor(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };

        // Xor `num` with `this`
        BN.prototype.xor = function xor(num) {
          if (this.length > num.length) return this.clone().ixor(num);
          return num.clone().ixor(this);
        };

        BN.prototype.uxor = function uxor(num) {
          if (this.length > num.length) return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };

        // Not ``this`` with ``width`` bitwidth
        BN.prototype.inotn = function inotn(width) {
          assert(typeof width === 'number' && width >= 0);

          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;

          // Extend the buffer with leading zeroes
          this._expand(bytesNeeded);

          if (bitsLeft > 0) {
            bytesNeeded--;
          }

          // Handle complete words
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 0x3ffffff;
          }

          // Handle the residue
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
          }

          // And remove leading zeroes
          return this.strip();
        };

        BN.prototype.notn = function notn(width) {
          return this.clone().inotn(width);
        };

        // Set `bit` of `this`
        BN.prototype.setn = function setn(bit, val) {
          assert(typeof bit === 'number' && bit >= 0);

          var off = bit / 26 | 0;
          var wbit = bit % 26;

          this._expand(off + 1);

          if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }

          return this.strip();
        };

        // Add `num` to `this` in-place
        BN.prototype.iadd = function iadd(num) {
          var r;

          // negative + positive
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();

            // positive + negative
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }

          // a.length > b.length
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }

          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
            // Copy the rest of the words
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          return this;
        };

        // Add `num` to `this`
        BN.prototype.add = function add(num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }

          if (this.length > num.length) return this.clone().iadd(num);

          return num.clone().iadd(this);
        };

        // Subtract `num` from `this` in-place
        BN.prototype.isub = function isub(num) {
          // this - (-num) = this + num
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();

            // -this - num = -(this + num)
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }

          // At this point both numbers are positive
          var cmp = this.cmp(num);

          // Optimization - zeroify
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }

          // a > b
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }

          // Copy rest of the words
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = Math.max(this.length, i);

          if (a !== this) {
            this.negative = 1;
          }

          return this.strip();
        };

        // Subtract `num` from `this`
        BN.prototype.sub = function sub(num) {
          return this.clone().isub(num);
        };

        function smallMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          var len = self.length + num.length | 0;
          out.length = len;
          len = len - 1 | 0;

          // Peel one iteration (compiler can't do it, because of code complexity)
          var a = self.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          var carry = r / 0x4000000 | 0;
          out.words[0] = lo;

          for (var k = 1; k < len; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = carry >>> 26;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j | 0;
              a = self.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += r / 0x4000000 | 0;
              rword = r & 0x3ffffff;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }

          return out.strip();
        }

        // TODO(indutny): it may be reasonable to omit it for users who don't need
        // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
        // multiplication (like elliptic secp256k1).
        var comb10MulTo = function comb10MulTo(self, num, out) {
          var a = self.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 0x1fff;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 0x1fff;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 0x1fff;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 0x1fff;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 0x1fff;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 0x1fff;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 0x1fff;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 0x1fff;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 0x1fff;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 0x1fff;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 0x1fff;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 0x1fff;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 0x1fff;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 0x1fff;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 0x1fff;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 0x1fff;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 0x1fff;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 0x1fff;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 0x1fff;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 0x1fff;
          var bh9 = b9 >>> 13;

          out.negative = self.negative ^ num.negative;
          out.length = 19;
          /* k = 0 */
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = mid + Math.imul(ah0, bl0) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
          w0 &= 0x3ffffff;
          /* k = 1 */
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = mid + Math.imul(ah1, bl0) | 0;
          hi = Math.imul(ah1, bh0);
          lo = lo + Math.imul(al0, bl1) | 0;
          mid = mid + Math.imul(al0, bh1) | 0;
          mid = mid + Math.imul(ah0, bl1) | 0;
          hi = hi + Math.imul(ah0, bh1) | 0;
          var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
          w1 &= 0x3ffffff;
          /* k = 2 */
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = mid + Math.imul(ah2, bl0) | 0;
          hi = Math.imul(ah2, bh0);
          lo = lo + Math.imul(al1, bl1) | 0;
          mid = mid + Math.imul(al1, bh1) | 0;
          mid = mid + Math.imul(ah1, bl1) | 0;
          hi = hi + Math.imul(ah1, bh1) | 0;
          lo = lo + Math.imul(al0, bl2) | 0;
          mid = mid + Math.imul(al0, bh2) | 0;
          mid = mid + Math.imul(ah0, bl2) | 0;
          hi = hi + Math.imul(ah0, bh2) | 0;
          var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
          w2 &= 0x3ffffff;
          /* k = 3 */
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = mid + Math.imul(ah3, bl0) | 0;
          hi = Math.imul(ah3, bh0);
          lo = lo + Math.imul(al2, bl1) | 0;
          mid = mid + Math.imul(al2, bh1) | 0;
          mid = mid + Math.imul(ah2, bl1) | 0;
          hi = hi + Math.imul(ah2, bh1) | 0;
          lo = lo + Math.imul(al1, bl2) | 0;
          mid = mid + Math.imul(al1, bh2) | 0;
          mid = mid + Math.imul(ah1, bl2) | 0;
          hi = hi + Math.imul(ah1, bh2) | 0;
          lo = lo + Math.imul(al0, bl3) | 0;
          mid = mid + Math.imul(al0, bh3) | 0;
          mid = mid + Math.imul(ah0, bl3) | 0;
          hi = hi + Math.imul(ah0, bh3) | 0;
          var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
          w3 &= 0x3ffffff;
          /* k = 4 */
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = mid + Math.imul(ah4, bl0) | 0;
          hi = Math.imul(ah4, bh0);
          lo = lo + Math.imul(al3, bl1) | 0;
          mid = mid + Math.imul(al3, bh1) | 0;
          mid = mid + Math.imul(ah3, bl1) | 0;
          hi = hi + Math.imul(ah3, bh1) | 0;
          lo = lo + Math.imul(al2, bl2) | 0;
          mid = mid + Math.imul(al2, bh2) | 0;
          mid = mid + Math.imul(ah2, bl2) | 0;
          hi = hi + Math.imul(ah2, bh2) | 0;
          lo = lo + Math.imul(al1, bl3) | 0;
          mid = mid + Math.imul(al1, bh3) | 0;
          mid = mid + Math.imul(ah1, bl3) | 0;
          hi = hi + Math.imul(ah1, bh3) | 0;
          lo = lo + Math.imul(al0, bl4) | 0;
          mid = mid + Math.imul(al0, bh4) | 0;
          mid = mid + Math.imul(ah0, bl4) | 0;
          hi = hi + Math.imul(ah0, bh4) | 0;
          var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
          w4 &= 0x3ffffff;
          /* k = 5 */
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = mid + Math.imul(ah5, bl0) | 0;
          hi = Math.imul(ah5, bh0);
          lo = lo + Math.imul(al4, bl1) | 0;
          mid = mid + Math.imul(al4, bh1) | 0;
          mid = mid + Math.imul(ah4, bl1) | 0;
          hi = hi + Math.imul(ah4, bh1) | 0;
          lo = lo + Math.imul(al3, bl2) | 0;
          mid = mid + Math.imul(al3, bh2) | 0;
          mid = mid + Math.imul(ah3, bl2) | 0;
          hi = hi + Math.imul(ah3, bh2) | 0;
          lo = lo + Math.imul(al2, bl3) | 0;
          mid = mid + Math.imul(al2, bh3) | 0;
          mid = mid + Math.imul(ah2, bl3) | 0;
          hi = hi + Math.imul(ah2, bh3) | 0;
          lo = lo + Math.imul(al1, bl4) | 0;
          mid = mid + Math.imul(al1, bh4) | 0;
          mid = mid + Math.imul(ah1, bl4) | 0;
          hi = hi + Math.imul(ah1, bh4) | 0;
          lo = lo + Math.imul(al0, bl5) | 0;
          mid = mid + Math.imul(al0, bh5) | 0;
          mid = mid + Math.imul(ah0, bl5) | 0;
          hi = hi + Math.imul(ah0, bh5) | 0;
          var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
          w5 &= 0x3ffffff;
          /* k = 6 */
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = mid + Math.imul(ah6, bl0) | 0;
          hi = Math.imul(ah6, bh0);
          lo = lo + Math.imul(al5, bl1) | 0;
          mid = mid + Math.imul(al5, bh1) | 0;
          mid = mid + Math.imul(ah5, bl1) | 0;
          hi = hi + Math.imul(ah5, bh1) | 0;
          lo = lo + Math.imul(al4, bl2) | 0;
          mid = mid + Math.imul(al4, bh2) | 0;
          mid = mid + Math.imul(ah4, bl2) | 0;
          hi = hi + Math.imul(ah4, bh2) | 0;
          lo = lo + Math.imul(al3, bl3) | 0;
          mid = mid + Math.imul(al3, bh3) | 0;
          mid = mid + Math.imul(ah3, bl3) | 0;
          hi = hi + Math.imul(ah3, bh3) | 0;
          lo = lo + Math.imul(al2, bl4) | 0;
          mid = mid + Math.imul(al2, bh4) | 0;
          mid = mid + Math.imul(ah2, bl4) | 0;
          hi = hi + Math.imul(ah2, bh4) | 0;
          lo = lo + Math.imul(al1, bl5) | 0;
          mid = mid + Math.imul(al1, bh5) | 0;
          mid = mid + Math.imul(ah1, bl5) | 0;
          hi = hi + Math.imul(ah1, bh5) | 0;
          lo = lo + Math.imul(al0, bl6) | 0;
          mid = mid + Math.imul(al0, bh6) | 0;
          mid = mid + Math.imul(ah0, bl6) | 0;
          hi = hi + Math.imul(ah0, bh6) | 0;
          var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
          w6 &= 0x3ffffff;
          /* k = 7 */
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = mid + Math.imul(ah7, bl0) | 0;
          hi = Math.imul(ah7, bh0);
          lo = lo + Math.imul(al6, bl1) | 0;
          mid = mid + Math.imul(al6, bh1) | 0;
          mid = mid + Math.imul(ah6, bl1) | 0;
          hi = hi + Math.imul(ah6, bh1) | 0;
          lo = lo + Math.imul(al5, bl2) | 0;
          mid = mid + Math.imul(al5, bh2) | 0;
          mid = mid + Math.imul(ah5, bl2) | 0;
          hi = hi + Math.imul(ah5, bh2) | 0;
          lo = lo + Math.imul(al4, bl3) | 0;
          mid = mid + Math.imul(al4, bh3) | 0;
          mid = mid + Math.imul(ah4, bl3) | 0;
          hi = hi + Math.imul(ah4, bh3) | 0;
          lo = lo + Math.imul(al3, bl4) | 0;
          mid = mid + Math.imul(al3, bh4) | 0;
          mid = mid + Math.imul(ah3, bl4) | 0;
          hi = hi + Math.imul(ah3, bh4) | 0;
          lo = lo + Math.imul(al2, bl5) | 0;
          mid = mid + Math.imul(al2, bh5) | 0;
          mid = mid + Math.imul(ah2, bl5) | 0;
          hi = hi + Math.imul(ah2, bh5) | 0;
          lo = lo + Math.imul(al1, bl6) | 0;
          mid = mid + Math.imul(al1, bh6) | 0;
          mid = mid + Math.imul(ah1, bl6) | 0;
          hi = hi + Math.imul(ah1, bh6) | 0;
          lo = lo + Math.imul(al0, bl7) | 0;
          mid = mid + Math.imul(al0, bh7) | 0;
          mid = mid + Math.imul(ah0, bl7) | 0;
          hi = hi + Math.imul(ah0, bh7) | 0;
          var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
          w7 &= 0x3ffffff;
          /* k = 8 */
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = mid + Math.imul(ah8, bl0) | 0;
          hi = Math.imul(ah8, bh0);
          lo = lo + Math.imul(al7, bl1) | 0;
          mid = mid + Math.imul(al7, bh1) | 0;
          mid = mid + Math.imul(ah7, bl1) | 0;
          hi = hi + Math.imul(ah7, bh1) | 0;
          lo = lo + Math.imul(al6, bl2) | 0;
          mid = mid + Math.imul(al6, bh2) | 0;
          mid = mid + Math.imul(ah6, bl2) | 0;
          hi = hi + Math.imul(ah6, bh2) | 0;
          lo = lo + Math.imul(al5, bl3) | 0;
          mid = mid + Math.imul(al5, bh3) | 0;
          mid = mid + Math.imul(ah5, bl3) | 0;
          hi = hi + Math.imul(ah5, bh3) | 0;
          lo = lo + Math.imul(al4, bl4) | 0;
          mid = mid + Math.imul(al4, bh4) | 0;
          mid = mid + Math.imul(ah4, bl4) | 0;
          hi = hi + Math.imul(ah4, bh4) | 0;
          lo = lo + Math.imul(al3, bl5) | 0;
          mid = mid + Math.imul(al3, bh5) | 0;
          mid = mid + Math.imul(ah3, bl5) | 0;
          hi = hi + Math.imul(ah3, bh5) | 0;
          lo = lo + Math.imul(al2, bl6) | 0;
          mid = mid + Math.imul(al2, bh6) | 0;
          mid = mid + Math.imul(ah2, bl6) | 0;
          hi = hi + Math.imul(ah2, bh6) | 0;
          lo = lo + Math.imul(al1, bl7) | 0;
          mid = mid + Math.imul(al1, bh7) | 0;
          mid = mid + Math.imul(ah1, bl7) | 0;
          hi = hi + Math.imul(ah1, bh7) | 0;
          lo = lo + Math.imul(al0, bl8) | 0;
          mid = mid + Math.imul(al0, bh8) | 0;
          mid = mid + Math.imul(ah0, bl8) | 0;
          hi = hi + Math.imul(ah0, bh8) | 0;
          var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
          w8 &= 0x3ffffff;
          /* k = 9 */
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = mid + Math.imul(ah9, bl0) | 0;
          hi = Math.imul(ah9, bh0);
          lo = lo + Math.imul(al8, bl1) | 0;
          mid = mid + Math.imul(al8, bh1) | 0;
          mid = mid + Math.imul(ah8, bl1) | 0;
          hi = hi + Math.imul(ah8, bh1) | 0;
          lo = lo + Math.imul(al7, bl2) | 0;
          mid = mid + Math.imul(al7, bh2) | 0;
          mid = mid + Math.imul(ah7, bl2) | 0;
          hi = hi + Math.imul(ah7, bh2) | 0;
          lo = lo + Math.imul(al6, bl3) | 0;
          mid = mid + Math.imul(al6, bh3) | 0;
          mid = mid + Math.imul(ah6, bl3) | 0;
          hi = hi + Math.imul(ah6, bh3) | 0;
          lo = lo + Math.imul(al5, bl4) | 0;
          mid = mid + Math.imul(al5, bh4) | 0;
          mid = mid + Math.imul(ah5, bl4) | 0;
          hi = hi + Math.imul(ah5, bh4) | 0;
          lo = lo + Math.imul(al4, bl5) | 0;
          mid = mid + Math.imul(al4, bh5) | 0;
          mid = mid + Math.imul(ah4, bl5) | 0;
          hi = hi + Math.imul(ah4, bh5) | 0;
          lo = lo + Math.imul(al3, bl6) | 0;
          mid = mid + Math.imul(al3, bh6) | 0;
          mid = mid + Math.imul(ah3, bl6) | 0;
          hi = hi + Math.imul(ah3, bh6) | 0;
          lo = lo + Math.imul(al2, bl7) | 0;
          mid = mid + Math.imul(al2, bh7) | 0;
          mid = mid + Math.imul(ah2, bl7) | 0;
          hi = hi + Math.imul(ah2, bh7) | 0;
          lo = lo + Math.imul(al1, bl8) | 0;
          mid = mid + Math.imul(al1, bh8) | 0;
          mid = mid + Math.imul(ah1, bl8) | 0;
          hi = hi + Math.imul(ah1, bh8) | 0;
          lo = lo + Math.imul(al0, bl9) | 0;
          mid = mid + Math.imul(al0, bh9) | 0;
          mid = mid + Math.imul(ah0, bl9) | 0;
          hi = hi + Math.imul(ah0, bh9) | 0;
          var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
          w9 &= 0x3ffffff;
          /* k = 10 */
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = mid + Math.imul(ah9, bl1) | 0;
          hi = Math.imul(ah9, bh1);
          lo = lo + Math.imul(al8, bl2) | 0;
          mid = mid + Math.imul(al8, bh2) | 0;
          mid = mid + Math.imul(ah8, bl2) | 0;
          hi = hi + Math.imul(ah8, bh2) | 0;
          lo = lo + Math.imul(al7, bl3) | 0;
          mid = mid + Math.imul(al7, bh3) | 0;
          mid = mid + Math.imul(ah7, bl3) | 0;
          hi = hi + Math.imul(ah7, bh3) | 0;
          lo = lo + Math.imul(al6, bl4) | 0;
          mid = mid + Math.imul(al6, bh4) | 0;
          mid = mid + Math.imul(ah6, bl4) | 0;
          hi = hi + Math.imul(ah6, bh4) | 0;
          lo = lo + Math.imul(al5, bl5) | 0;
          mid = mid + Math.imul(al5, bh5) | 0;
          mid = mid + Math.imul(ah5, bl5) | 0;
          hi = hi + Math.imul(ah5, bh5) | 0;
          lo = lo + Math.imul(al4, bl6) | 0;
          mid = mid + Math.imul(al4, bh6) | 0;
          mid = mid + Math.imul(ah4, bl6) | 0;
          hi = hi + Math.imul(ah4, bh6) | 0;
          lo = lo + Math.imul(al3, bl7) | 0;
          mid = mid + Math.imul(al3, bh7) | 0;
          mid = mid + Math.imul(ah3, bl7) | 0;
          hi = hi + Math.imul(ah3, bh7) | 0;
          lo = lo + Math.imul(al2, bl8) | 0;
          mid = mid + Math.imul(al2, bh8) | 0;
          mid = mid + Math.imul(ah2, bl8) | 0;
          hi = hi + Math.imul(ah2, bh8) | 0;
          lo = lo + Math.imul(al1, bl9) | 0;
          mid = mid + Math.imul(al1, bh9) | 0;
          mid = mid + Math.imul(ah1, bl9) | 0;
          hi = hi + Math.imul(ah1, bh9) | 0;
          var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
          w10 &= 0x3ffffff;
          /* k = 11 */
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = mid + Math.imul(ah9, bl2) | 0;
          hi = Math.imul(ah9, bh2);
          lo = lo + Math.imul(al8, bl3) | 0;
          mid = mid + Math.imul(al8, bh3) | 0;
          mid = mid + Math.imul(ah8, bl3) | 0;
          hi = hi + Math.imul(ah8, bh3) | 0;
          lo = lo + Math.imul(al7, bl4) | 0;
          mid = mid + Math.imul(al7, bh4) | 0;
          mid = mid + Math.imul(ah7, bl4) | 0;
          hi = hi + Math.imul(ah7, bh4) | 0;
          lo = lo + Math.imul(al6, bl5) | 0;
          mid = mid + Math.imul(al6, bh5) | 0;
          mid = mid + Math.imul(ah6, bl5) | 0;
          hi = hi + Math.imul(ah6, bh5) | 0;
          lo = lo + Math.imul(al5, bl6) | 0;
          mid = mid + Math.imul(al5, bh6) | 0;
          mid = mid + Math.imul(ah5, bl6) | 0;
          hi = hi + Math.imul(ah5, bh6) | 0;
          lo = lo + Math.imul(al4, bl7) | 0;
          mid = mid + Math.imul(al4, bh7) | 0;
          mid = mid + Math.imul(ah4, bl7) | 0;
          hi = hi + Math.imul(ah4, bh7) | 0;
          lo = lo + Math.imul(al3, bl8) | 0;
          mid = mid + Math.imul(al3, bh8) | 0;
          mid = mid + Math.imul(ah3, bl8) | 0;
          hi = hi + Math.imul(ah3, bh8) | 0;
          lo = lo + Math.imul(al2, bl9) | 0;
          mid = mid + Math.imul(al2, bh9) | 0;
          mid = mid + Math.imul(ah2, bl9) | 0;
          hi = hi + Math.imul(ah2, bh9) | 0;
          var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
          w11 &= 0x3ffffff;
          /* k = 12 */
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = mid + Math.imul(ah9, bl3) | 0;
          hi = Math.imul(ah9, bh3);
          lo = lo + Math.imul(al8, bl4) | 0;
          mid = mid + Math.imul(al8, bh4) | 0;
          mid = mid + Math.imul(ah8, bl4) | 0;
          hi = hi + Math.imul(ah8, bh4) | 0;
          lo = lo + Math.imul(al7, bl5) | 0;
          mid = mid + Math.imul(al7, bh5) | 0;
          mid = mid + Math.imul(ah7, bl5) | 0;
          hi = hi + Math.imul(ah7, bh5) | 0;
          lo = lo + Math.imul(al6, bl6) | 0;
          mid = mid + Math.imul(al6, bh6) | 0;
          mid = mid + Math.imul(ah6, bl6) | 0;
          hi = hi + Math.imul(ah6, bh6) | 0;
          lo = lo + Math.imul(al5, bl7) | 0;
          mid = mid + Math.imul(al5, bh7) | 0;
          mid = mid + Math.imul(ah5, bl7) | 0;
          hi = hi + Math.imul(ah5, bh7) | 0;
          lo = lo + Math.imul(al4, bl8) | 0;
          mid = mid + Math.imul(al4, bh8) | 0;
          mid = mid + Math.imul(ah4, bl8) | 0;
          hi = hi + Math.imul(ah4, bh8) | 0;
          lo = lo + Math.imul(al3, bl9) | 0;
          mid = mid + Math.imul(al3, bh9) | 0;
          mid = mid + Math.imul(ah3, bl9) | 0;
          hi = hi + Math.imul(ah3, bh9) | 0;
          var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
          w12 &= 0x3ffffff;
          /* k = 13 */
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = mid + Math.imul(ah9, bl4) | 0;
          hi = Math.imul(ah9, bh4);
          lo = lo + Math.imul(al8, bl5) | 0;
          mid = mid + Math.imul(al8, bh5) | 0;
          mid = mid + Math.imul(ah8, bl5) | 0;
          hi = hi + Math.imul(ah8, bh5) | 0;
          lo = lo + Math.imul(al7, bl6) | 0;
          mid = mid + Math.imul(al7, bh6) | 0;
          mid = mid + Math.imul(ah7, bl6) | 0;
          hi = hi + Math.imul(ah7, bh6) | 0;
          lo = lo + Math.imul(al6, bl7) | 0;
          mid = mid + Math.imul(al6, bh7) | 0;
          mid = mid + Math.imul(ah6, bl7) | 0;
          hi = hi + Math.imul(ah6, bh7) | 0;
          lo = lo + Math.imul(al5, bl8) | 0;
          mid = mid + Math.imul(al5, bh8) | 0;
          mid = mid + Math.imul(ah5, bl8) | 0;
          hi = hi + Math.imul(ah5, bh8) | 0;
          lo = lo + Math.imul(al4, bl9) | 0;
          mid = mid + Math.imul(al4, bh9) | 0;
          mid = mid + Math.imul(ah4, bl9) | 0;
          hi = hi + Math.imul(ah4, bh9) | 0;
          var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
          w13 &= 0x3ffffff;
          /* k = 14 */
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = mid + Math.imul(ah9, bl5) | 0;
          hi = Math.imul(ah9, bh5);
          lo = lo + Math.imul(al8, bl6) | 0;
          mid = mid + Math.imul(al8, bh6) | 0;
          mid = mid + Math.imul(ah8, bl6) | 0;
          hi = hi + Math.imul(ah8, bh6) | 0;
          lo = lo + Math.imul(al7, bl7) | 0;
          mid = mid + Math.imul(al7, bh7) | 0;
          mid = mid + Math.imul(ah7, bl7) | 0;
          hi = hi + Math.imul(ah7, bh7) | 0;
          lo = lo + Math.imul(al6, bl8) | 0;
          mid = mid + Math.imul(al6, bh8) | 0;
          mid = mid + Math.imul(ah6, bl8) | 0;
          hi = hi + Math.imul(ah6, bh8) | 0;
          lo = lo + Math.imul(al5, bl9) | 0;
          mid = mid + Math.imul(al5, bh9) | 0;
          mid = mid + Math.imul(ah5, bl9) | 0;
          hi = hi + Math.imul(ah5, bh9) | 0;
          var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
          w14 &= 0x3ffffff;
          /* k = 15 */
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = mid + Math.imul(ah9, bl6) | 0;
          hi = Math.imul(ah9, bh6);
          lo = lo + Math.imul(al8, bl7) | 0;
          mid = mid + Math.imul(al8, bh7) | 0;
          mid = mid + Math.imul(ah8, bl7) | 0;
          hi = hi + Math.imul(ah8, bh7) | 0;
          lo = lo + Math.imul(al7, bl8) | 0;
          mid = mid + Math.imul(al7, bh8) | 0;
          mid = mid + Math.imul(ah7, bl8) | 0;
          hi = hi + Math.imul(ah7, bh8) | 0;
          lo = lo + Math.imul(al6, bl9) | 0;
          mid = mid + Math.imul(al6, bh9) | 0;
          mid = mid + Math.imul(ah6, bl9) | 0;
          hi = hi + Math.imul(ah6, bh9) | 0;
          var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
          w15 &= 0x3ffffff;
          /* k = 16 */
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = mid + Math.imul(ah9, bl7) | 0;
          hi = Math.imul(ah9, bh7);
          lo = lo + Math.imul(al8, bl8) | 0;
          mid = mid + Math.imul(al8, bh8) | 0;
          mid = mid + Math.imul(ah8, bl8) | 0;
          hi = hi + Math.imul(ah8, bh8) | 0;
          lo = lo + Math.imul(al7, bl9) | 0;
          mid = mid + Math.imul(al7, bh9) | 0;
          mid = mid + Math.imul(ah7, bl9) | 0;
          hi = hi + Math.imul(ah7, bh9) | 0;
          var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
          w16 &= 0x3ffffff;
          /* k = 17 */
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = mid + Math.imul(ah9, bl8) | 0;
          hi = Math.imul(ah9, bh8);
          lo = lo + Math.imul(al8, bl9) | 0;
          mid = mid + Math.imul(al8, bh9) | 0;
          mid = mid + Math.imul(ah8, bl9) | 0;
          hi = hi + Math.imul(ah8, bh9) | 0;
          var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
          w17 &= 0x3ffffff;
          /* k = 18 */
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = mid + Math.imul(ah9, bl9) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
          w18 &= 0x3ffffff;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };

        // Polyfill comb
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }

        function bigMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          out.length = self.length + num.length;

          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;

              var lo = r & 0x3ffffff;
              ncarry = ncarry + (r / 0x4000000 | 0) | 0;
              lo = lo + rword | 0;
              rword = lo & 0x3ffffff;
              ncarry = ncarry + (lo >>> 26) | 0;

              hncarry += ncarry >>> 26;
              ncarry &= 0x3ffffff;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }

          return out.strip();
        }

        function jumboMulTo(self, num, out) {
          var fftm = new FFTM();
          return fftm.mulp(self, num, out);
        }

        BN.prototype.mulTo = function mulTo(num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }

          return res;
        };

        // Cooley-Tukey algorithm for FFT
        // slightly revisited to rely on looping instead of recursion

        function FFTM(x, y) {
          this.x = x;
          this.y = y;
        }

        FFTM.prototype.makeRBT = function makeRBT(N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }

          return t;
        };

        // Returns binary-reversed representation of `x`
        FFTM.prototype.revBin = function revBin(x, l, N) {
          if (x === 0 || x === N - 1) return x;

          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
          }

          return rb;
        };

        // Performs "tweedling" phase, therefore 'emulating'
        // behaviour of the recursive algorithm
        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };

        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);

          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;

            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);

            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;

              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];

                var ro = rtws[p + j + s];
                var io = itws[p + j + s];

                var rx = rtwdf_ * ro - itwdf_ * io;

                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;

                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;

                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;

                /* jshint maxdepth : false */
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;

                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };

        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }

          return 1 << i + 1 + odd;
        };

        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
          if (N <= 1) return;

          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];

            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;

            t = iws[i];

            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };

        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;

            ws[i] = w & 0x3ffffff;

            if (w < 0x4000000) {
              carry = 0;
            } else {
              carry = w / 0x4000000 | 0;
            }
          }

          return ws;
        };

        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);

            rws[2 * i] = carry & 0x1fff;carry = carry >>> 13;
            rws[2 * i + 1] = carry & 0x1fff;carry = carry >>> 13;
          }

          // Pad with zeroes
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }

          assert(carry === 0);
          assert((carry & ~0x1fff) === 0);
        };

        FFTM.prototype.stub = function stub(N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }

          return ph;
        };

        FFTM.prototype.mulp = function mulp(x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);

          var rbt = this.makeRBT(N);

          var _ = this.stub(N);

          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);

          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);

          var rmws = out.words;
          rmws.length = N;

          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);

          this.transform(rws, _, rwst, iwst, N, rbt);
          this.transform(nrws, _, nrwst, niwst, N, rbt);

          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }

          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _, N, rbt);
          this.conjugate(rmws, _, N);
          this.normalize13b(rmws, N);

          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out.strip();
        };

        // Multiply `this` by `num`
        BN.prototype.mul = function mul(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };

        // Multiply employing FFT
        BN.prototype.mulf = function mulf(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };

        // In-place Multiplication
        BN.prototype.imul = function imul(num) {
          return this.clone().mulTo(num, this);
        };

        BN.prototype.imuln = function imuln(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);

          // Carry
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
            carry >>= 26;
            carry += w / 0x4000000 | 0;
            // NOTE: lo is 27bit maximum
            carry += lo >>> 26;
            this.words[i] = lo & 0x3ffffff;
          }

          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }

          return this;
        };

        BN.prototype.muln = function muln(num) {
          return this.clone().imuln(num);
        };

        // `this` * `this`
        BN.prototype.sqr = function sqr() {
          return this.mul(this);
        };

        // `this` * `this` in-place
        BN.prototype.isqr = function isqr() {
          return this.imul(this.clone());
        };

        // Math.pow(`this`, `num`)
        BN.prototype.pow = function pow(num) {
          var w = toBitArray(num);
          if (w.length === 0) return new BN(1);

          // Skip leading zeroes
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0) break;
          }

          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0) continue;

              res = res.mul(q);
            }
          }

          return res;
        };

        // Shift-left in-place
        BN.prototype.iushln = function iushln(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
          var i;

          if (r !== 0) {
            var carry = 0;

            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = (this.words[i] | 0) - newCarry << r;
              this.words[i] = c | carry;
              carry = newCarry >>> 26 - r;
            }

            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }

          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }

            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }

            this.length += s;
          }

          return this.strip();
        };

        BN.prototype.ishln = function ishln(bits) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushln(bits);
        };

        // Shift-right in-place
        // NOTE: `hint` is a lowest bit before trailing zeroes
        // NOTE: if `extended` is present - it will be filled with destroyed bits
        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
          assert(typeof bits === 'number' && bits >= 0);
          var h;
          if (hint) {
            h = (hint - hint % 26) / 26;
          } else {
            h = 0;
          }

          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
          var maskedWords = extended;

          h -= s;
          h = Math.max(0, h);

          // Extended mode, copy masked part
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }

          if (s === 0) {
            // No-op, we should not move anything at all
          } else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }

          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
          }

          // Push carried bits as a mask
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }

          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }

          return this.strip();
        };

        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };

        // Shift-left
        BN.prototype.shln = function shln(bits) {
          return this.clone().ishln(bits);
        };

        BN.prototype.ushln = function ushln(bits) {
          return this.clone().iushln(bits);
        };

        // Shift-right
        BN.prototype.shrn = function shrn(bits) {
          return this.clone().ishrn(bits);
        };

        BN.prototype.ushrn = function ushrn(bits) {
          return this.clone().iushrn(bits);
        };

        // Test if n bit is set
        BN.prototype.testn = function testn(bit) {
          assert(typeof bit === 'number' && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) return false;

          // Check bit and return
          var w = this.words[s];

          return !!(w & q);
        };

        // Return only lowers bits of number (in-place)
        BN.prototype.imaskn = function imaskn(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;

          assert(this.negative === 0, 'imaskn works only with positive numbers');

          if (this.length <= s) {
            return this;
          }

          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);

          if (r !== 0) {
            var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
            this.words[this.length - 1] &= mask;
          }

          return this.strip();
        };

        // Return only lowers bits of number
        BN.prototype.maskn = function maskn(bits) {
          return this.clone().imaskn(bits);
        };

        // Add plain number `num` to `this`
        BN.prototype.iaddn = function iaddn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.isubn(-num);

          // Possible sign change
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) < num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }

            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }

          // Add without checks
          return this._iaddn(num);
        };

        BN.prototype._iaddn = function _iaddn(num) {
          this.words[0] += num;

          // Carry
          for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
            this.words[i] -= 0x4000000;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);

          return this;
        };

        // Subtract plain number `num` from `this`
        BN.prototype.isubn = function isubn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.iaddn(-num);

          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }

          this.words[0] -= num;

          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            // Carry
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 0x4000000;
              this.words[i + 1] -= 1;
            }
          }

          return this.strip();
        };

        BN.prototype.addn = function addn(num) {
          return this.clone().iaddn(num);
        };

        BN.prototype.subn = function subn(num) {
          return this.clone().isubn(num);
        };

        BN.prototype.iabs = function iabs() {
          this.negative = 0;

          return this;
        };

        BN.prototype.abs = function abs() {
          return this.clone().iabs();
        };

        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
          var len = num.length + shift;
          var i;

          this._expand(len);

          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 0x3ffffff;
            carry = (w >> 26) - (right / 0x4000000 | 0);
            this.words[i + shift] = w & 0x3ffffff;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 0x3ffffff;
          }

          if (carry === 0) return this.strip();

          // Subtraction overflow
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 0x3ffffff;
          }
          this.negative = 1;

          return this.strip();
        };

        BN.prototype._wordDiv = function _wordDiv(num, mode) {
          var shift = this.length - num.length;

          var a = this.clone();
          var b = num;

          // Normalize
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }

          // Initialize quotient
          var m = a.length - b.length;
          var q;

          if (mode !== 'mod') {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }

          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }

          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0);

            // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
            // (0x7ffffff)
            qj = Math.min(qj / bhi | 0, 0x3ffffff);

            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q.strip();
          }
          a.strip();

          // Denormalize
          if (mode !== 'div' && shift !== 0) {
            a.iushrn(shift);
          }

          return {
            div: q || null,
            mod: a
          };
        };

        // NOTE: 1) `mode` can be set to `mod` to request mod only,
        //       to `div` to request div only, or be absent to
        //       request both div & mod
        //       2) `positive` is true if unsigned mod is requested
        BN.prototype.divmod = function divmod(num, mode, positive) {
          assert(!num.isZero());

          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }

          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }

            return {
              div: div,
              mod: mod
            };
          }

          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            return {
              div: div,
              mod: res.mod
            };
          }

          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }

            return {
              div: res.div,
              mod: mod
            };
          }

          // Both numbers are positive at this point

          // Strip both numbers to approximate shift value
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }

          // Very short reduction
          if (num.length === 1) {
            if (mode === 'div') {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }

            if (mode === 'mod') {
              return {
                div: null,
                mod: new BN(this.modn(num.words[0]))
              };
            }

            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modn(num.words[0]))
            };
          }

          return this._wordDiv(num, mode);
        };

        // Find `this` / `num`
        BN.prototype.div = function div(num) {
          return this.divmod(num, 'div', false).div;
        };

        // Find `this` % `num`
        BN.prototype.mod = function mod(num) {
          return this.divmod(num, 'mod', false).mod;
        };

        BN.prototype.umod = function umod(num) {
          return this.divmod(num, 'mod', true).mod;
        };

        // Find Round(`this` / `num`)
        BN.prototype.divRound = function divRound(num) {
          var dm = this.divmod(num);

          // Fast case - exact division
          if (dm.mod.isZero()) return dm.div;

          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);

          // Round down
          if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

          // Round up
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };

        BN.prototype.modn = function modn(num) {
          assert(num <= 0x3ffffff);
          var p = (1 << 26) % num;

          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }

          return acc;
        };

        // In-place division by number
        BN.prototype.idivn = function idivn(num) {
          assert(num <= 0x3ffffff);

          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 0x4000000;
            this.words[i] = w / num | 0;
            carry = w % num;
          }

          return this.strip();
        };

        BN.prototype.divn = function divn(num) {
          return this.clone().idivn(num);
        };

        BN.prototype.egcd = function egcd(p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var x = this;
          var y = p.clone();

          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }

          // A * x + B * y = x
          var A = new BN(1);
          var B = new BN(0);

          // C * x + D * y = y
          var C = new BN(0);
          var D = new BN(1);

          var g = 0;

          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }

          var yp = y.clone();
          var xp = x.clone();

          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }

                A.iushrn(1);
                B.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }

                C.iushrn(1);
                D.iushrn(1);
              }
            }

            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }

          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };

        // This is reduced incarnation of the binary EEA
        // above, designated to invert members of the
        // _prime_ fields F(p) at a maximal speed
        BN.prototype._invmp = function _invmp(p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var a = this;
          var b = p.clone();

          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }

          var x1 = new BN(1);
          var x2 = new BN(0);

          var delta = b.clone();

          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }

                x1.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }

                x2.iushrn(1);
              }
            }

            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }

          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }

          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }

          return res;
        };

        BN.prototype.gcd = function gcd(num) {
          if (this.isZero()) return num.abs();
          if (num.isZero()) return this.abs();

          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;

          // Remove common factor of two
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }

          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }

            var r = a.cmp(b);
            if (r < 0) {
              // Swap `a` and `b` to make `a` always bigger than `b`
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }

            a.isub(b);
          } while (true);

          return b.iushln(shift);
        };

        // Invert number in the field F(num)
        BN.prototype.invm = function invm(num) {
          return this.egcd(num).a.umod(num);
        };

        BN.prototype.isEven = function isEven() {
          return (this.words[0] & 1) === 0;
        };

        BN.prototype.isOdd = function isOdd() {
          return (this.words[0] & 1) === 1;
        };

        // And first word and num
        BN.prototype.andln = function andln(num) {
          return this.words[0] & num;
        };

        // Increment at the bit position in-line
        BN.prototype.bincn = function bincn(bit) {
          assert(typeof bit === 'number');
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }

          // Add bit and propagate, if needed
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 0x3ffffff;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };

        BN.prototype.isZero = function isZero() {
          return this.length === 1 && this.words[0] === 0;
        };

        BN.prototype.cmpn = function cmpn(num) {
          var negative = num < 0;

          if (this.negative !== 0 && !negative) return -1;
          if (this.negative === 0 && negative) return 1;

          this.strip();

          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }

            assert(num <= 0x3ffffff, 'Number is too big');

            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Compare two numbers and return:
        // 1 - if `this` > `num`
        // 0 - if `this` == `num`
        // -1 - if `this` < `num`
        BN.prototype.cmp = function cmp(num) {
          if (this.negative !== 0 && num.negative === 0) return -1;
          if (this.negative === 0 && num.negative !== 0) return 1;

          var res = this.ucmp(num);
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Unsigned comparison
        BN.prototype.ucmp = function ucmp(num) {
          // At this point both numbers have the same sign
          if (this.length > num.length) return 1;
          if (this.length < num.length) return -1;

          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;

            if (a === b) continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };

        BN.prototype.gtn = function gtn(num) {
          return this.cmpn(num) === 1;
        };

        BN.prototype.gt = function gt(num) {
          return this.cmp(num) === 1;
        };

        BN.prototype.gten = function gten(num) {
          return this.cmpn(num) >= 0;
        };

        BN.prototype.gte = function gte(num) {
          return this.cmp(num) >= 0;
        };

        BN.prototype.ltn = function ltn(num) {
          return this.cmpn(num) === -1;
        };

        BN.prototype.lt = function lt(num) {
          return this.cmp(num) === -1;
        };

        BN.prototype.lten = function lten(num) {
          return this.cmpn(num) <= 0;
        };

        BN.prototype.lte = function lte(num) {
          return this.cmp(num) <= 0;
        };

        BN.prototype.eqn = function eqn(num) {
          return this.cmpn(num) === 0;
        };

        BN.prototype.eq = function eq(num) {
          return this.cmp(num) === 0;
        };

        //
        // A reduce context, could be using montgomery or something better, depending
        // on the `m` itself.
        //
        BN.red = function red(num) {
          return new Red(num);
        };

        BN.prototype.toRed = function toRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          assert(this.negative === 0, 'red works only with positives');
          return ctx.convertTo(this)._forceRed(ctx);
        };

        BN.prototype.fromRed = function fromRed() {
          assert(this.red, 'fromRed works only with numbers in reduction context');
          return this.red.convertFrom(this);
        };

        BN.prototype._forceRed = function _forceRed(ctx) {
          this.red = ctx;
          return this;
        };

        BN.prototype.forceRed = function forceRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          return this._forceRed(ctx);
        };

        BN.prototype.redAdd = function redAdd(num) {
          assert(this.red, 'redAdd works only with red numbers');
          return this.red.add(this, num);
        };

        BN.prototype.redIAdd = function redIAdd(num) {
          assert(this.red, 'redIAdd works only with red numbers');
          return this.red.iadd(this, num);
        };

        BN.prototype.redSub = function redSub(num) {
          assert(this.red, 'redSub works only with red numbers');
          return this.red.sub(this, num);
        };

        BN.prototype.redISub = function redISub(num) {
          assert(this.red, 'redISub works only with red numbers');
          return this.red.isub(this, num);
        };

        BN.prototype.redShl = function redShl(num) {
          assert(this.red, 'redShl works only with red numbers');
          return this.red.shl(this, num);
        };

        BN.prototype.redMul = function redMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };

        BN.prototype.redIMul = function redIMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };

        BN.prototype.redSqr = function redSqr() {
          assert(this.red, 'redSqr works only with red numbers');
          this.red._verify1(this);
          return this.red.sqr(this);
        };

        BN.prototype.redISqr = function redISqr() {
          assert(this.red, 'redISqr works only with red numbers');
          this.red._verify1(this);
          return this.red.isqr(this);
        };

        // Square root over p
        BN.prototype.redSqrt = function redSqrt() {
          assert(this.red, 'redSqrt works only with red numbers');
          this.red._verify1(this);
          return this.red.sqrt(this);
        };

        BN.prototype.redInvm = function redInvm() {
          assert(this.red, 'redInvm works only with red numbers');
          this.red._verify1(this);
          return this.red.invm(this);
        };

        // Return negative clone of `this` % `red modulo`
        BN.prototype.redNeg = function redNeg() {
          assert(this.red, 'redNeg works only with red numbers');
          this.red._verify1(this);
          return this.red.neg(this);
        };

        BN.prototype.redPow = function redPow(num) {
          assert(this.red && !num.red, 'redPow(normalNum)');
          this.red._verify1(this);
          return this.red.pow(this, num);
        };

        // Prime numbers with efficient reduction
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };

        // Pseudo-Mersenne prime
        function MPrime(name, p) {
          // P = 2 ^ N - K
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);

          this.tmp = this._tmp();
        }

        MPrime.prototype._tmp = function _tmp() {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };

        MPrime.prototype.ireduce = function ireduce(num) {
          // Assumes that `num` is less than `P^2`
          // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
          var r = num;
          var rlen;

          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);

          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            r.strip();
          }

          return r;
        };

        MPrime.prototype.split = function split(input, out) {
          input.iushrn(this.n, 0, out);
        };

        MPrime.prototype.imulK = function imulK(num) {
          return num.imul(this.k);
        };

        function K256() {
          MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
        }
        inherits(K256, MPrime);

        K256.prototype.split = function split(input, output) {
          // 256 = 9 * 26 + 22
          var mask = 0x3fffff;

          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;

          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }

          // Shift by 9 limbs
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;

          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };

        K256.prototype.imulK = function imulK(num) {
          // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;

          // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 0x3d1;
            num.words[i] = lo & 0x3ffffff;
            lo = w * 0x40 + (lo / 0x4000000 | 0);
          }

          // Fast length reduction
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };

        function P224() {
          MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
        }
        inherits(P224, MPrime);

        function P192() {
          MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
        }
        inherits(P192, MPrime);

        function P25519() {
          // 2 ^ 255 - 19
          MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
        }
        inherits(P25519, MPrime);

        P25519.prototype.imulK = function imulK(num) {
          // K = 0x13
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 0x13 + carry;
            var lo = hi & 0x3ffffff;
            hi >>>= 26;

            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };

        // Exported mostly for testing purposes, use plain name instead
        BN._prime = function prime(name) {
          // Cached version of prime
          if (primes[name]) return primes[name];

          var prime;
          if (name === 'k256') {
            prime = new K256();
          } else if (name === 'p224') {
            prime = new P224();
          } else if (name === 'p192') {
            prime = new P192();
          } else if (name === 'p25519') {
            prime = new P25519();
          } else {
            throw new Error('Unknown prime ' + name);
          }
          primes[name] = prime;

          return prime;
        };

        //
        // Base reduction engine
        //
        function Red(m) {
          if (typeof m === 'string') {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), 'modulus must be greater than 1');
            this.m = m;
            this.prime = null;
          }
        }

        Red.prototype._verify1 = function _verify1(a) {
          assert(a.negative === 0, 'red works only with positives');
          assert(a.red, 'red works only with red numbers');
        };

        Red.prototype._verify2 = function _verify2(a, b) {
          assert((a.negative | b.negative) === 0, 'red works only with positives');
          assert(a.red && a.red === b.red, 'red works only with red numbers');
        };

        Red.prototype.imod = function imod(a) {
          if (this.prime) return this.prime.ireduce(a)._forceRed(this);
          return a.umod(this.m)._forceRed(this);
        };

        Red.prototype.neg = function neg(a) {
          if (a.isZero()) {
            return a.clone();
          }

          return this.m.sub(a)._forceRed(this);
        };

        Red.prototype.add = function add(a, b) {
          this._verify2(a, b);

          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.iadd = function iadd(a, b) {
          this._verify2(a, b);

          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };

        Red.prototype.sub = function sub(a, b) {
          this._verify2(a, b);

          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.isub = function isub(a, b) {
          this._verify2(a, b);

          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };

        Red.prototype.shl = function shl(a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };

        Red.prototype.imul = function imul(a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };

        Red.prototype.mul = function mul(a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };

        Red.prototype.isqr = function isqr(a) {
          return this.imul(a, a.clone());
        };

        Red.prototype.sqr = function sqr(a) {
          return this.mul(a, a);
        };

        Red.prototype.sqrt = function sqrt(a) {
          if (a.isZero()) return a.clone();

          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);

          // Fast case
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }

          // Tonelli-Shanks algorithm (Totally unoptimized and slow)
          //
          // Find Q and S, that Q * 2 ^ S = (P - 1)
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());

          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();

          // Find quadratic non-residue
          // NOTE: Max is such because of generalized Riemann hypothesis.
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);

          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }

          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));

            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }

          return r;
        };

        Red.prototype.invm = function invm(a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };

        Red.prototype.pow = function pow(a, num) {
          if (num.isZero()) return new BN(1);
          if (num.cmpn(1) === 0) return a.clone();

          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }

          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }

          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = word >> j & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }

              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }

              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }

          return res;
        };

        Red.prototype.convertTo = function convertTo(num) {
          var r = num.umod(this.m);

          return r === num ? r.clone() : r;
        };

        Red.prototype.convertFrom = function convertFrom(num) {
          var res = num.clone();
          res.red = null;
          return res;
        };

        //
        // Montgomery method engine
        //

        BN.mont = function mont(num) {
          return new Mont(num);
        };

        function Mont(m) {
          Red.call(this, m);

          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }

          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);

          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);

        Mont.prototype.convertTo = function convertTo(num) {
          return this.imod(num.ushln(this.shift));
        };

        Mont.prototype.convertFrom = function convertFrom(num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };

        Mont.prototype.imul = function imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }

          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;

          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.mul = function mul(a, b) {
          if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.invm = function invm(a) {
          // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })(typeof module === 'undefined' || module, this);
    }, {}], 13: [function (require, module, exports) {
      var BN = require('bn.js');
      var stripHexPrefix = require('strip-hex-prefix');

      /**
       * Returns a BN object, converts a number value to a BN
       * @param {String|Number|Object} `arg` input a string number, hex string number, number, BigNumber or BN object
       * @return {Object} `output` BN object of the number
       * @throws if the argument is not an array, object that isn't a bignumber, not a string number or number
       */
      module.exports = function numberToBN(arg) {
        if (typeof arg === 'string' || typeof arg === 'number') {
          var multiplier = new BN(1); // eslint-disable-line
          var formattedString = String(arg).toLowerCase().trim();
          var isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
          var stringArg = stripHexPrefix(formattedString); // eslint-disable-line
          if (stringArg.substr(0, 1) === '-') {
            stringArg = stripHexPrefix(stringArg.slice(1));
            multiplier = new BN(-1, 10);
          }
          stringArg = stringArg === '' ? '0' : stringArg;

          if (!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/) || stringArg.match(/^[a-fA-F]+$/) || isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/)) {
            return new BN(stringArg, 16).mul(multiplier);
          }

          if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
            return new BN(stringArg, 10).mul(multiplier);
          }
        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg.toString && !arg.pop && !arg.push) {
          if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
            return new BN(arg.toString(10), 10);
          }
        }

        throw new Error('[number-to-bn] while converting number ' + JSON.stringify(arg) + ' to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.');
      };
    }, { "bn.js": 12, "strip-hex-prefix": 50 }], 14: [function (require, module, exports) {
      'use strict';

      var has = Object.prototype.hasOwnProperty,
          prefix = '~';

      /**
       * Constructor to create a storage for our `EE` objects.
       * An `Events` instance is a plain object whose properties are event names.
       *
       * @constructor
       * @private
       */
      function Events() {}

      //
      // We try to not inherit from `Object.prototype`. In some engines creating an
      // instance in this way is faster than calling `Object.create(null)` directly.
      // If `Object.create(null)` is not supported we prefix the event names with a
      // character to make sure that the built-in object properties are not
      // overridden or used as an attack vector.
      //
      if (Object.create) {
        Events.prototype = Object.create(null);

        //
        // This hack is needed because the `__proto__` property is still inherited in
        // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
        //
        if (!new Events().__proto__) prefix = false;
      }

      /**
       * Representation of a single event listener.
       *
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
       * @constructor
       * @private
       */
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }

      /**
       * Add a listener for a given event.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} once Specify if the listener is a one-time listener.
       * @returns {EventEmitter}
       * @private
       */
      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== 'function') {
          throw new TypeError('The listener must be a function');
        }

        var listener = new EE(fn, context || emitter, once),
            evt = prefix ? prefix + event : event;

        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];

        return emitter;
      }

      /**
       * Clear event by name.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} evt The Event name.
       * @private
       */
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
      }

      /**
       * Minimal `EventEmitter` interface that is molded against the Node.js
       * `EventEmitter` interface.
       *
       * @constructor
       * @public
       */
      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }

      /**
       * Return an array listing the events for which the emitter has registered
       * listeners.
       *
       * @returns {Array}
       * @public
       */
      EventEmitter.prototype.eventNames = function eventNames() {
        var names = [],
            events,
            name;

        if (this._eventsCount === 0) return names;

        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }

        return names;
      };

      /**
       * Return the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Array} The registered listeners.
       * @public
       */
      EventEmitter.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event,
            handlers = this._events[evt];

        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];

        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }

        return ee;
      };

      /**
       * Return the number of listeners listening to a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Number} The number of listeners.
       * @public
       */
      EventEmitter.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event,
            listeners = this._events[evt];

        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };

      /**
       * Calls each of the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Boolean} `true` if the event had listeners, else `false`.
       * @public
       */
      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return false;

        var listeners = this._events[evt],
            len = arguments.length,
            args,
            i;

        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }

          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }

          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length,
              j;

          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }

                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }

        return true;
      };

      /**
       * Add a listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };

      /**
       * Add a one-time listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };

      /**
       * Remove the listeners of a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn Only remove the listeners that match this function.
       * @param {*} context Only remove the listeners that have this context.
       * @param {Boolean} once Only remove one-time listeners.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }

        var listeners = this._events[evt];

        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }

          //
          // Reset the array, or remove it completely if we have no more listeners.
          //
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
        }

        return this;
      };

      /**
       * Remove all listeners, or those of the specified event.
       *
       * @param {(String|Symbol)} [event] The event name.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;

        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }

        return this;
      };

      //
      // Alias methods names because people roll like that.
      //
      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on;

      //
      // Expose the prefix.
      //
      EventEmitter.prefixed = prefix;

      //
      // Allow `EventEmitter` to be imported as module namespace.
      //
      EventEmitter.EventEmitter = EventEmitter;

      //
      // Expose the module.
      //
      if ('undefined' !== typeof module) {
        module.exports = EventEmitter;
      }
    }, {}], 15: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      function EventEmitter() {
        this._events = this._events || {};
        this._maxListeners = this._maxListeners || undefined;
      }
      module.exports = EventEmitter;

      // Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter;

      EventEmitter.prototype._events = undefined;
      EventEmitter.prototype._maxListeners = undefined;

      // By default EventEmitters will print a warning if more than 10 listeners are
      // added to it. This is a useful default which helps finding memory leaks.
      EventEmitter.defaultMaxListeners = 10;

      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function (n) {
        if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
        this._maxListeners = n;
        return this;
      };

      EventEmitter.prototype.emit = function (type) {
        var er, handler, len, args, i, listeners;

        if (!this._events) this._events = {};

        // If there is no 'error' event listener then throw.
        if (type === 'error') {
          if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
            er = arguments[1];
            if (er instanceof Error) {
              throw er; // Unhandled 'error' event
            } else {
              // At least give some kind of context to the user
              var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
              err.context = er;
              throw err;
            }
          }
        }

        handler = this._events[type];

        if (isUndefined(handler)) return false;

        if (isFunction(handler)) {
          switch (arguments.length) {
            // fast cases
            case 1:
              handler.call(this);
              break;
            case 2:
              handler.call(this, arguments[1]);
              break;
            case 3:
              handler.call(this, arguments[1], arguments[2]);
              break;
            // slower
            default:
              args = Array.prototype.slice.call(arguments, 1);
              handler.apply(this, args);
          }
        } else if (isObject(handler)) {
          args = Array.prototype.slice.call(arguments, 1);
          listeners = handler.slice();
          len = listeners.length;
          for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
          }
        }

        return true;
      };

      EventEmitter.prototype.addListener = function (type, listener) {
        var m;

        if (!isFunction(listener)) throw TypeError('listener must be a function');

        if (!this._events) this._events = {};

        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

        if (!this._events[type])
          // Optimize the case of one listener. Don't need the extra array object.
          this._events[type] = listener;else if (isObject(this._events[type]))
          // If we've already got an array, just append.
          this._events[type].push(listener);else
          // Adding the second element, need to change to array.
          this._events[type] = [this._events[type], listener];

        // Check for listener leak
        if (isObject(this._events[type]) && !this._events[type].warned) {
          if (!isUndefined(this._maxListeners)) {
            m = this._maxListeners;
          } else {
            m = EventEmitter.defaultMaxListeners;
          }

          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            if (typeof console.trace === 'function') {
              // not supported in IE 10
              console.trace();
            }
          }
        }

        return this;
      };

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.once = function (type, listener) {
        if (!isFunction(listener)) throw TypeError('listener must be a function');

        var fired = false;

        function g() {
          this.removeListener(type, g);

          if (!fired) {
            fired = true;
            listener.apply(this, arguments);
          }
        }

        g.listener = listener;
        this.on(type, g);

        return this;
      };

      // emits a 'removeListener' event iff the listener was removed
      EventEmitter.prototype.removeListener = function (type, listener) {
        var list, position, length, i;

        if (!isFunction(listener)) throw TypeError('listener must be a function');

        if (!this._events || !this._events[type]) return this;

        list = this._events[type];
        length = list.length;
        position = -1;

        if (list === listener || isFunction(list.listener) && list.listener === listener) {
          delete this._events[type];
          if (this._events.removeListener) this.emit('removeListener', type, listener);
        } else if (isObject(list)) {
          for (i = length; i-- > 0;) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
              position = i;
              break;
            }
          }

          if (position < 0) return this;

          if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
          } else {
            list.splice(position, 1);
          }

          if (this._events.removeListener) this.emit('removeListener', type, listener);
        }

        return this;
      };

      EventEmitter.prototype.removeAllListeners = function (type) {
        var key, listeners;

        if (!this._events) return this;

        // not listening for removeListener, no need to emit
        if (!this._events.removeListener) {
          if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          for (key in this._events) {
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = {};
          return this;
        }

        listeners = this._events[type];

        if (isFunction(listeners)) {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          while (listeners.length) {
            this.removeListener(type, listeners[listeners.length - 1]);
          }
        }
        delete this._events[type];

        return this;
      };

      EventEmitter.prototype.listeners = function (type) {
        var ret;
        if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
        return ret;
      };

      EventEmitter.prototype.listenerCount = function (type) {
        if (this._events) {
          var evlistener = this._events[type];

          if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
        }
        return 0;
      };

      EventEmitter.listenerCount = function (emitter, type) {
        return emitter.listenerCount(type);
      };

      function isFunction(arg) {
        return typeof arg === 'function';
      }

      function isNumber(arg) {
        return typeof arg === 'number';
      }

      function isObject(arg) {
        return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
      }

      function isUndefined(arg) {
        return arg === void 0;
      }
    }, {}], 16: [function (require, module, exports) {
      var http = require('http');
      var url = require('url');

      var https = module.exports;

      for (var key in http) {
        if (http.hasOwnProperty(key)) https[key] = http[key];
      }

      https.request = function (params, cb) {
        params = validateParams(params);
        return http.request.call(this, params, cb);
      };

      https.get = function (params, cb) {
        params = validateParams(params);
        return http.get.call(this, params, cb);
      };

      function validateParams(params) {
        if (typeof params === 'string') {
          params = url.parse(params);
        }
        if (!params.protocol) {
          params.protocol = 'https:';
        }
        if (params.protocol !== 'https:') {
          throw new Error('Protocol "' + params.protocol + '" not supported. Expected "https:"');
        }
        return params;
      }
    }, { "http": 46, "url": 54 }], 17: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];

        i += d;

        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }

          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
      };
    }, {}], 18: [function (require, module, exports) {
      if (typeof Object.create === 'function') {
        // implementation from standard node.js 'util' module
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        };
      } else {
        // old school shim for old browsers
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function TempCtor() {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        };
      }
    }, {}], 19: [function (require, module, exports) {
      /*!
       * Determine if an object is a Buffer
       *
       * @author   Feross Aboukhadijeh <https://feross.org>
       * @license  MIT
       */

      // The _isBuffer check is for Safari 5-7 support, because it's missing
      // Object.prototype.constructor. Remove this eventually
      module.exports = function (obj) {
        return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
      };

      function isBuffer(obj) {
        return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
      }

      // For Node v0.10 support. Remove this eventually.
      function isSlowBuffer(obj) {
        return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
      }
    }, {}], 20: [function (require, module, exports) {
      /**
       * Returns a `Boolean` on whether or not the a `String` starts with '0x'
       * @param {String} str the string input value
       * @return {Boolean} a boolean if it is or is not hex prefixed
       * @throws if the str input is not a string
       */
      module.exports = function isHexPrefixed(str) {
        if (typeof str !== 'string') {
          throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str === "undefined" ? "undefined" : _typeof(str)) + ", while checking isHexPrefixed.");
        }

        return str.slice(0, 2) === '0x';
      };
    }, {}], 21: [function (require, module, exports) {
      var toString = {}.toString;

      module.exports = Array.isArray || function (arr) {
        return toString.call(arr) == '[object Array]';
      };
    }, {}], 22: [function (require, module, exports) {
      arguments[4][12][0].apply(exports, arguments);
    }, { "dup": 12 }], 23: [function (require, module, exports) {
      var BN = require('bn.js');
      var isHexPrefixed = require('is-hex-prefixed');
      var stripHexPrefix = require('strip-hex-prefix');

      /**
       * Returns a BN object, converts a number value to a BN
       * @param {String|Number|Object} `arg` input a string number, hex string number, number, BigNumber or BN object
       * @return {Object} `output` BN object of the number
       * @throws if the argument is not an array, object that isn't a bignumber, not a string number or number
       */
      module.exports = function numberToBN(arg) {
        var errorMessage = new Error('[number-to-bn] while converting number to BN.js object, argument "' + String(arg) + '" type "' + String(typeof arg === "undefined" ? "undefined" : _typeof(arg)) + '" must be either a negative or positive (1) integer number, (2) string integer, (3) valid prefixed hex number string, (4) BN.js object instance or a (5) bignumber.js object.');
        if (typeof arg === 'string') {
          if (arg.match(/0[xX][0-9a-fA-F]+/) || arg.match(/^-?[0-9]+$/)) {
            if (isHexPrefixed(arg)) {
              return new BN(stripHexPrefix(arg), 16);
            } else if (arg.substr(0, 3) === '-0x') {
              return new BN('-' + String(arg.slice(3)), 16);
            } else {
              // eslint-disable-line
              return new BN(arg, 10);
            }
          } else {
            throw errorMessage;
          }
        } else if (typeof arg === 'number') {
          return new BN(String(arg));
        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg.toString && !arg.pop && !arg.push) {
          if (arg.toString(10).match(/^-?[0-9]+$/)) {
            if (arg.toArray && arg.toTwos) {
              return arg;
            } else {
              return new BN(arg.toString(10));
            }
          } else {
            throw errorMessage;
          }
        } else {
          throw errorMessage;
        }
      };
    }, { "bn.js": 22, "is-hex-prefixed": 20, "strip-hex-prefix": 50 }], 24: [function (require, module, exports) {
      // This file is the concatenation of many js files.
      // See http://github.com/jimhigson/oboe.js for the raw source

      // having a local undefined, window, Object etc allows slightly better minification:
      (function (window, Object, Array, Error, JSON, undefined) {

        // v2.1.3-15-g7432b49

        /*
        
        Copyright (c) 2013, Jim Higson
        
        All rights reserved.
        
        Redistribution and use in source and binary forms, with or without
        modification, are permitted provided that the following conditions are
        met:
        
        1.  Redistributions of source code must retain the above copyright
            notice, this list of conditions and the following disclaimer.
        
        2.  Redistributions in binary form must reproduce the above copyright
            notice, this list of conditions and the following disclaimer in the
            documentation and/or other materials provided with the distribution.
        
        THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
        IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
        TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
        PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
        HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
        SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
        TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
        PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
        LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
        NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
        SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        
        */

        /** 
         * Partially complete a function.
         * 
         *  var add3 = partialComplete( function add(a,b){return a+b}, 3 );
         *  
         *  add3(4) // gives 7
         *  
         *  function wrap(left, right, cen){return left + " " + cen + " " + right;}
         *  
         *  var pirateGreeting = partialComplete( wrap , "I'm", ", a mighty pirate!" );
         *  
         *  pirateGreeting("Guybrush Threepwood"); 
         *  // gives "I'm Guybrush Threepwood, a mighty pirate!"
         */
        var partialComplete = varArgs(function (fn, args) {

          // this isn't the shortest way to write this but it does
          // avoid creating a new array each time to pass to fn.apply,
          // otherwise could just call boundArgs.concat(callArgs)       

          var numBoundArgs = args.length;

          return varArgs(function (callArgs) {

            for (var i = 0; i < callArgs.length; i++) {
              args[numBoundArgs + i] = callArgs[i];
            }

            args.length = numBoundArgs + callArgs.length;

            return fn.apply(this, args);
          });
        }),


        /**
         * Compose zero or more functions:
         * 
         *    compose(f1, f2, f3)(x) = f1(f2(f3(x))))
         * 
         * The last (inner-most) function may take more than one parameter:
         * 
         *    compose(f1, f2, f3)(x,y) = f1(f2(f3(x,y))))
         */
        compose = varArgs(function (fns) {

          var fnsList = arrayAsList(fns);

          function next(params, curFn) {
            return [apply(params, curFn)];
          }

          return varArgs(function (startParams) {

            return foldR(next, startParams, fnsList)[0];
          });
        });

        /**
         * A more optimised version of compose that takes exactly two functions
         * @param f1
         * @param f2
         */
        function compose2(f1, f2) {
          return function () {
            return f1.call(this, f2.apply(this, arguments));
          };
        }

        /**
         * Generic form for a function to get a property from an object
         * 
         *    var o = {
         *       foo:'bar'
         *    }
         *    
         *    var getFoo = attr('foo')
         *    
         *    fetFoo(o) // returns 'bar'
         * 
         * @param {String} key the property name
         */
        function attr(key) {
          return function (o) {
            return o[key];
          };
        }

        /**
         * Call a list of functions with the same args until one returns a 
         * truthy result. Similar to the || operator.
         * 
         * So:
         *      lazyUnion([f1,f2,f3 ... fn])( p1, p2 ... pn )
         *      
         * Is equivalent to: 
         *      apply([p1, p2 ... pn], f1) || 
         *      apply([p1, p2 ... pn], f2) || 
         *      apply([p1, p2 ... pn], f3) ... apply(fn, [p1, p2 ... pn])  
         *  
         * @returns the first return value that is given that is truthy.
         */
        var lazyUnion = varArgs(function (fns) {

          return varArgs(function (params) {

            var maybeValue;

            for (var i = 0; i < len(fns); i++) {

              maybeValue = apply(params, fns[i]);

              if (maybeValue) {
                return maybeValue;
              }
            }
          });
        });

        /**
         * This file declares various pieces of functional programming.
         * 
         * This isn't a general purpose functional library, to keep things small it
         * has just the parts useful for Oboe.js.
         */

        /**
         * Call a single function with the given arguments array.
         * Basically, a functional-style version of the OO-style Function#apply for 
         * when we don't care about the context ('this') of the call.
         * 
         * The order of arguments allows partial completion of the arguments array
         */
        function apply(args, fn) {
          return fn.apply(undefined, args);
        }

        /**
         * Define variable argument functions but cut out all that tedious messing about 
         * with the arguments object. Delivers the variable-length part of the arguments
         * list as an array.
         * 
         * Eg:
         * 
         * var myFunction = varArgs(
         *    function( fixedArgument, otherFixedArgument, variableNumberOfArguments ){
         *       console.log( variableNumberOfArguments );
         *    }
         * )
         * 
         * myFunction('a', 'b', 1, 2, 3); // logs [1,2,3]
         * 
         * var myOtherFunction = varArgs(function( variableNumberOfArguments ){
         *    console.log( variableNumberOfArguments );
         * })
         * 
         * myFunction(1, 2, 3); // logs [1,2,3]
         * 
         */
        function varArgs(fn) {

          var numberOfFixedArguments = fn.length - 1,
              slice = Array.prototype.slice;

          if (numberOfFixedArguments == 0) {
            // an optimised case for when there are no fixed args:   

            return function () {
              return fn.call(this, slice.call(arguments));
            };
          } else if (numberOfFixedArguments == 1) {
            // an optimised case for when there are is one fixed args:

            return function () {
              return fn.call(this, arguments[0], slice.call(arguments, 1));
            };
          }

          // general case   

          // we know how many arguments fn will always take. Create a
          // fixed-size array to hold that many, to be re-used on
          // every call to the returned function
          var argsHolder = Array(fn.length);

          return function () {

            for (var i = 0; i < numberOfFixedArguments; i++) {
              argsHolder[i] = arguments[i];
            }

            argsHolder[numberOfFixedArguments] = slice.call(arguments, numberOfFixedArguments);

            return fn.apply(this, argsHolder);
          };
        }

        /**
         * Swap the order of parameters to a binary function
         * 
         * A bit like this flip: http://zvon.org/other/haskell/Outputprelude/flip_f.html
         */
        function flip(fn) {
          return function (a, b) {
            return fn(b, a);
          };
        }

        /**
         * Create a function which is the intersection of two other functions.
         * 
         * Like the && operator, if the first is truthy, the second is never called,
         * otherwise the return value from the second is returned.
         */
        function lazyIntersection(fn1, fn2) {

          return function (param) {

            return fn1(param) && fn2(param);
          };
        }

        /**
         * A function which does nothing
         */
        function noop() {}

        /**
         * A function which is always happy
         */
        function always() {
          return true;
        }

        /**
         * Create a function which always returns the same
         * value
         * 
         * var return3 = functor(3);
         * 
         * return3() // gives 3
         * return3() // still gives 3
         * return3() // will always give 3
         */
        function functor(val) {
          return function () {
            return val;
          };
        }

        /**
         * This file defines some loosely associated syntactic sugar for 
         * Javascript programming 
         */

        /**
         * Returns true if the given candidate is of type T
         */
        function isOfType(T, maybeSomething) {
          return maybeSomething && maybeSomething.constructor === T;
        }

        var len = attr('length'),
            isString = partialComplete(isOfType, String);

        /** 
         * I don't like saying this:
         * 
         *    foo !=== undefined
         *    
         * because of the double-negative. I find this:
         * 
         *    defined(foo)
         *    
         * easier to read.
         */
        function defined(value) {
          return value !== undefined;
        }

        /**
         * Returns true if object o has a key named like every property in 
         * the properties array. Will give false if any are missing, or if o 
         * is not an object.
         */
        function hasAllProperties(fieldList, o) {

          return o instanceof Object && all(function (field) {
            return field in o;
          }, fieldList);
        }
        /**
         * Like cons in Lisp
         */
        function cons(x, xs) {

          /* Internally lists are linked 2-element Javascript arrays.
                 
             Ideally the return here would be Object.freeze([x,xs])
             so that bugs related to mutation are found fast.
             However, cons is right on the critical path for
             performance and this slows oboe-mark down by
             ~25%. Under theoretical future JS engines that freeze more
             efficiently (possibly even use immutability to
             run faster) this should be considered for
             restoration.
          */

          return [x, xs];
        }

        /**
         * The empty list
         */
        var emptyList = null,


        /**
         * Get the head of a list.
         * 
         * Ie, head(cons(a,b)) = a
         */
        head = attr(0),


        /**
         * Get the tail of a list.
         * 
         * Ie, tail(cons(a,b)) = b
         */
        tail = attr(1);

        /** 
         * Converts an array to a list 
         * 
         *    asList([a,b,c])
         * 
         * is equivalent to:
         *    
         *    cons(a, cons(b, cons(c, emptyList))) 
         **/
        function arrayAsList(inputArray) {

          return reverseList(inputArray.reduce(flip(cons), emptyList));
        }

        /**
         * A varargs version of arrayAsList. Works a bit like list
         * in LISP.
         * 
         *    list(a,b,c) 
         *    
         * is equivalent to:
         * 
         *    cons(a, cons(b, cons(c, emptyList)))
         */
        var list = varArgs(arrayAsList);

        /**
         * Convert a list back to a js native array
         */
        function listAsArray(list) {

          return foldR(function (arraySoFar, listItem) {

            arraySoFar.unshift(listItem);
            return arraySoFar;
          }, [], list);
        }

        /**
         * Map a function over a list 
         */
        function map(fn, list) {

          return list ? cons(fn(head(list)), map(fn, tail(list))) : emptyList;
        }

        /**
         * foldR implementation. Reduce a list down to a single value.
         * 
         * @pram {Function} fn     (rightEval, curVal) -> result 
         */
        function foldR(fn, startValue, list) {

          return list ? fn(foldR(fn, startValue, tail(list)), head(list)) : startValue;
        }

        /**
         * foldR implementation. Reduce a list down to a single value.
         * 
         * @pram {Function} fn     (rightEval, curVal) -> result 
         */
        function foldR1(fn, list) {

          return tail(list) ? fn(foldR1(fn, tail(list)), head(list)) : head(list);
        }

        /**
         * Return a list like the one given but with the first instance equal 
         * to item removed 
         */
        function without(list, test, removedFn) {

          return withoutInner(list, removedFn || noop);

          function withoutInner(subList, removedFn) {
            return subList ? test(head(subList)) ? (removedFn(head(subList)), tail(subList)) : cons(head(subList), withoutInner(tail(subList), removedFn)) : emptyList;
          }
        }

        /** 
         * Returns true if the given function holds for every item in 
         * the list, false otherwise 
         */
        function all(fn, list) {

          return !list || fn(head(list)) && all(fn, tail(list));
        }

        /**
         * Call every function in a list of functions with the same arguments
         * 
         * This doesn't make any sense if we're doing pure functional because 
         * it doesn't return anything. Hence, this is only really useful if the
         * functions being called have side-effects. 
         */
        function applyEach(fnList, args) {

          if (fnList) {
            head(fnList).apply(null, args);

            applyEach(tail(fnList), args);
          }
        }

        /**
         * Reverse the order of a list
         */
        function reverseList(list) {

          // js re-implementation of 3rd solution from:
          //    http://www.haskell.org/haskellwiki/99_questions/Solutions/5
          function reverseInner(list, reversedAlready) {
            if (!list) {
              return reversedAlready;
            }

            return reverseInner(tail(list), cons(head(list), reversedAlready));
          }

          return reverseInner(list, emptyList);
        }

        function first(test, list) {
          return list && (test(head(list)) ? head(list) : first(test, tail(list)));
        }

        /* 
           This is a slightly hacked-up browser only version of clarinet 
           
              *  some features removed to help keep browser Oboe under 
                 the 5k micro-library limit
              *  plug directly into event bus
           
           For the original go here:
              https://github.com/dscape/clarinet
        
           We receive the events:
              STREAM_DATA
              STREAM_END
              
           We emit the events:
              SAX_KEY
              SAX_VALUE_OPEN
              SAX_VALUE_CLOSE      
              FAIL_EVENT      
         */

        function clarinet(eventBus) {
          "use strict";

          var
          // shortcut some events on the bus
          emitSaxKey = eventBus(SAX_KEY).emit,
              emitValueOpen = eventBus(SAX_VALUE_OPEN).emit,
              emitValueClose = eventBus(SAX_VALUE_CLOSE).emit,
              emitFail = eventBus(FAIL_EVENT).emit,
              MAX_BUFFER_LENGTH = 64 * 1024,
              stringTokenPattern = /[\\"\n]/g,
              _n = 0

          // states
          ,
              BEGIN = _n++,
              VALUE = _n++ // general stuff
          ,
              OPEN_OBJECT = _n++ // {
          ,
              CLOSE_OBJECT = _n++ // }
          ,
              OPEN_ARRAY = _n++ // [
          ,
              CLOSE_ARRAY = _n++ // ]
          ,
              STRING = _n++ // ""
          ,
              OPEN_KEY = _n++ // , "a"
          ,
              CLOSE_KEY = _n++ // :
          ,
              TRUE = _n++ // r
          ,
              TRUE2 = _n++ // u
          ,
              TRUE3 = _n++ // e
          ,
              FALSE = _n++ // a
          ,
              FALSE2 = _n++ // l
          ,
              FALSE3 = _n++ // s
          ,
              FALSE4 = _n++ // e
          ,
              NULL = _n++ // u
          ,
              NULL2 = _n++ // l
          ,
              NULL3 = _n++ // l
          ,
              NUMBER_DECIMAL_POINT = _n++ // .
          ,
              NUMBER_DIGIT = _n // [0-9]

          // setup initial parser values
          ,
              bufferCheckPosition = MAX_BUFFER_LENGTH,
              latestError,
              c,
              p,
              textNode = undefined,
              numberNode = "",
              slashed = false,
              closed = false,
              state = BEGIN,
              stack = [],
              unicodeS = null,
              unicodeI = 0,
              depth = 0,
              position = 0,
              column = 0 //mostly for error reporting
          ,
              line = 1;

          function checkBufferLength() {

            var maxActual = 0;

            if (textNode !== undefined && textNode.length > MAX_BUFFER_LENGTH) {
              emitError("Max buffer length exceeded: textNode");
              maxActual = Math.max(maxActual, textNode.length);
            }
            if (numberNode.length > MAX_BUFFER_LENGTH) {
              emitError("Max buffer length exceeded: numberNode");
              maxActual = Math.max(maxActual, numberNode.length);
            }

            bufferCheckPosition = MAX_BUFFER_LENGTH - maxActual + position;
          }

          eventBus(STREAM_DATA).on(handleData);

          /* At the end of the http content close the clarinet 
           This will provide an error if the total content provided was not 
           valid json, ie if not all arrays, objects and Strings closed properly */
          eventBus(STREAM_END).on(handleStreamEnd);

          function emitError(errorString) {
            if (textNode !== undefined) {
              emitValueOpen(textNode);
              emitValueClose();
              textNode = undefined;
            }

            latestError = Error(errorString + "\nLn: " + line + "\nCol: " + column + "\nChr: " + c);

            emitFail(errorReport(undefined, undefined, latestError));
          }

          function handleStreamEnd() {
            if (state == BEGIN) {
              // Handle the case where the stream closes without ever receiving
              // any input. This isn't an error - response bodies can be blank,
              // particularly for 204 http responses

              // Because of how Oboe is currently implemented, we parse a
              // completely empty stream as containing an empty object.
              // This is because Oboe's done event is only fired when the
              // root object of the JSON stream closes.

              // This should be decoupled and attached instead to the input stream
              // from the http (or whatever) resource ending.
              // If this decoupling could happen the SAX parser could simply emit
              // zero events on a completely empty input.
              emitValueOpen({});
              emitValueClose();

              closed = true;
              return;
            }

            if (state !== VALUE || depth !== 0) emitError("Unexpected end");

            if (textNode !== undefined) {
              emitValueOpen(textNode);
              emitValueClose();
              textNode = undefined;
            }

            closed = true;
          }

          function whitespace(c) {
            return c == '\r' || c == '\n' || c == ' ' || c == '\t';
          }

          function handleData(chunk) {

            // this used to throw the error but inside Oboe we will have already
            // gotten the error when it was emitted. The important thing is to
            // not continue with the parse.
            if (latestError) return;

            if (closed) {
              return emitError("Cannot write after close");
            }

            var i = 0;
            c = chunk[0];

            while (c) {
              if (i > 0) {
                p = c;
              }
              c = chunk[i++];
              if (!c) break;

              position++;
              if (c == "\n") {
                line++;
                column = 0;
              } else column++;
              switch (state) {

                case BEGIN:
                  if (c === "{") state = OPEN_OBJECT;else if (c === "[") state = OPEN_ARRAY;else if (!whitespace(c)) return emitError("Non-whitespace before {[.");
                  continue;

                case OPEN_KEY:
                case OPEN_OBJECT:
                  if (whitespace(c)) continue;
                  if (state === OPEN_KEY) stack.push(CLOSE_KEY);else {
                    if (c === '}') {
                      emitValueOpen({});
                      emitValueClose();
                      state = stack.pop() || VALUE;
                      continue;
                    } else stack.push(CLOSE_OBJECT);
                  }
                  if (c === '"') state = STRING;else return emitError("Malformed object key should start with \" ");
                  continue;

                case CLOSE_KEY:
                case CLOSE_OBJECT:
                  if (whitespace(c)) continue;

                  if (c === ':') {
                    if (state === CLOSE_OBJECT) {
                      stack.push(CLOSE_OBJECT);

                      if (textNode !== undefined) {
                        // was previously (in upstream Clarinet) one event
                        //  - object open came with the text of the first
                        emitValueOpen({});
                        emitSaxKey(textNode);
                        textNode = undefined;
                      }
                      depth++;
                    } else {
                      if (textNode !== undefined) {
                        emitSaxKey(textNode);
                        textNode = undefined;
                      }
                    }
                    state = VALUE;
                  } else if (c === '}') {
                    if (textNode !== undefined) {
                      emitValueOpen(textNode);
                      emitValueClose();
                      textNode = undefined;
                    }
                    emitValueClose();
                    depth--;
                    state = stack.pop() || VALUE;
                  } else if (c === ',') {
                    if (state === CLOSE_OBJECT) stack.push(CLOSE_OBJECT);
                    if (textNode !== undefined) {
                      emitValueOpen(textNode);
                      emitValueClose();
                      textNode = undefined;
                    }
                    state = OPEN_KEY;
                  } else return emitError('Bad object');
                  continue;

                case OPEN_ARRAY: // after an array there always a value
                case VALUE:
                  if (whitespace(c)) continue;
                  if (state === OPEN_ARRAY) {
                    emitValueOpen([]);
                    depth++;
                    state = VALUE;
                    if (c === ']') {
                      emitValueClose();
                      depth--;
                      state = stack.pop() || VALUE;
                      continue;
                    } else {
                      stack.push(CLOSE_ARRAY);
                    }
                  }
                  if (c === '"') state = STRING;else if (c === '{') state = OPEN_OBJECT;else if (c === '[') state = OPEN_ARRAY;else if (c === 't') state = TRUE;else if (c === 'f') state = FALSE;else if (c === 'n') state = NULL;else if (c === '-') {
                    // keep and continue
                    numberNode += c;
                  } else if (c === '0') {
                    numberNode += c;
                    state = NUMBER_DIGIT;
                  } else if ('123456789'.indexOf(c) !== -1) {
                    numberNode += c;
                    state = NUMBER_DIGIT;
                  } else return emitError("Bad value");
                  continue;

                case CLOSE_ARRAY:
                  if (c === ',') {
                    stack.push(CLOSE_ARRAY);
                    if (textNode !== undefined) {
                      emitValueOpen(textNode);
                      emitValueClose();
                      textNode = undefined;
                    }
                    state = VALUE;
                  } else if (c === ']') {
                    if (textNode !== undefined) {
                      emitValueOpen(textNode);
                      emitValueClose();
                      textNode = undefined;
                    }
                    emitValueClose();
                    depth--;
                    state = stack.pop() || VALUE;
                  } else if (whitespace(c)) continue;else return emitError('Bad array');
                  continue;

                case STRING:
                  if (textNode === undefined) {
                    textNode = "";
                  }

                  // thanks thejh, this is an about 50% performance improvement.
                  var starti = i - 1;

                  STRING_BIGLOOP: while (true) {

                    // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
                    while (unicodeI > 0) {
                      unicodeS += c;
                      c = chunk.charAt(i++);
                      if (unicodeI === 4) {
                        // TODO this might be slow? well, probably not used too often anyway
                        textNode += String.fromCharCode(parseInt(unicodeS, 16));
                        unicodeI = 0;
                        starti = i - 1;
                      } else {
                        unicodeI++;
                      }
                      // we can just break here: no stuff we skipped that still has to be sliced out or so
                      if (!c) break STRING_BIGLOOP;
                    }
                    if (c === '"' && !slashed) {
                      state = stack.pop() || VALUE;
                      textNode += chunk.substring(starti, i - 1);
                      break;
                    }
                    if (c === '\\' && !slashed) {
                      slashed = true;
                      textNode += chunk.substring(starti, i - 1);
                      c = chunk.charAt(i++);
                      if (!c) break;
                    }
                    if (slashed) {
                      slashed = false;
                      if (c === 'n') {
                        textNode += '\n';
                      } else if (c === 'r') {
                        textNode += '\r';
                      } else if (c === 't') {
                        textNode += '\t';
                      } else if (c === 'f') {
                        textNode += '\f';
                      } else if (c === 'b') {
                        textNode += '\b';
                      } else if (c === 'u') {
                        // \uxxxx. meh!
                        unicodeI = 1;
                        unicodeS = '';
                      } else {
                        textNode += c;
                      }
                      c = chunk.charAt(i++);
                      starti = i - 1;
                      if (!c) break;else continue;
                    }

                    stringTokenPattern.lastIndex = i;
                    var reResult = stringTokenPattern.exec(chunk);
                    if (!reResult) {
                      i = chunk.length + 1;
                      textNode += chunk.substring(starti, i - 1);
                      break;
                    }
                    i = reResult.index + 1;
                    c = chunk.charAt(reResult.index);
                    if (!c) {
                      textNode += chunk.substring(starti, i - 1);
                      break;
                    }
                  }
                  continue;

                case TRUE:
                  if (!c) continue; // strange buffers
                  if (c === 'r') state = TRUE2;else return emitError('Invalid true started with t' + c);
                  continue;

                case TRUE2:
                  if (!c) continue;
                  if (c === 'u') state = TRUE3;else return emitError('Invalid true started with tr' + c);
                  continue;

                case TRUE3:
                  if (!c) continue;
                  if (c === 'e') {
                    emitValueOpen(true);
                    emitValueClose();
                    state = stack.pop() || VALUE;
                  } else return emitError('Invalid true started with tru' + c);
                  continue;

                case FALSE:
                  if (!c) continue;
                  if (c === 'a') state = FALSE2;else return emitError('Invalid false started with f' + c);
                  continue;

                case FALSE2:
                  if (!c) continue;
                  if (c === 'l') state = FALSE3;else return emitError('Invalid false started with fa' + c);
                  continue;

                case FALSE3:
                  if (!c) continue;
                  if (c === 's') state = FALSE4;else return emitError('Invalid false started with fal' + c);
                  continue;

                case FALSE4:
                  if (!c) continue;
                  if (c === 'e') {
                    emitValueOpen(false);
                    emitValueClose();
                    state = stack.pop() || VALUE;
                  } else return emitError('Invalid false started with fals' + c);
                  continue;

                case NULL:
                  if (!c) continue;
                  if (c === 'u') state = NULL2;else return emitError('Invalid null started with n' + c);
                  continue;

                case NULL2:
                  if (!c) continue;
                  if (c === 'l') state = NULL3;else return emitError('Invalid null started with nu' + c);
                  continue;

                case NULL3:
                  if (!c) continue;
                  if (c === 'l') {
                    emitValueOpen(null);
                    emitValueClose();
                    state = stack.pop() || VALUE;
                  } else return emitError('Invalid null started with nul' + c);
                  continue;

                case NUMBER_DECIMAL_POINT:
                  if (c === '.') {
                    numberNode += c;
                    state = NUMBER_DIGIT;
                  } else return emitError('Leading zero not followed by .');
                  continue;

                case NUMBER_DIGIT:
                  if ('0123456789'.indexOf(c) !== -1) numberNode += c;else if (c === '.') {
                    if (numberNode.indexOf('.') !== -1) return emitError('Invalid number has two dots');
                    numberNode += c;
                  } else if (c === 'e' || c === 'E') {
                    if (numberNode.indexOf('e') !== -1 || numberNode.indexOf('E') !== -1) return emitError('Invalid number has two exponential');
                    numberNode += c;
                  } else if (c === "+" || c === "-") {
                    if (!(p === 'e' || p === 'E')) return emitError('Invalid symbol in number');
                    numberNode += c;
                  } else {
                    if (numberNode) {
                      emitValueOpen(parseFloat(numberNode));
                      emitValueClose();
                      numberNode = "";
                    }
                    i--; // go back one
                    state = stack.pop() || VALUE;
                  }
                  continue;

                default:
                  return emitError("Unknown state: " + state);
              }
            }
            if (position >= bufferCheckPosition) checkBufferLength();
          }
        }

        /** 
         * A bridge used to assign stateless functions to listen to clarinet.
         * 
         * As well as the parameter from clarinet, each callback will also be passed
         * the result of the last callback.
         * 
         * This may also be used to clear all listeners by assigning zero handlers:
         * 
         *    ascentManager( clarinet, {} )
         */
        function ascentManager(oboeBus, handlers) {
          "use strict";

          var listenerId = {},
              ascent;

          function stateAfter(handler) {
            return function (param) {
              ascent = handler(ascent, param);
            };
          }

          for (var eventName in handlers) {

            oboeBus(eventName).on(stateAfter(handlers[eventName]), listenerId);
          }

          oboeBus(NODE_SWAP).on(function (newNode) {

            var oldHead = head(ascent),
                key = keyOf(oldHead),
                ancestors = tail(ascent),
                parentNode;

            if (ancestors) {
              parentNode = nodeOf(head(ancestors));
              parentNode[key] = newNode;
            }
          });

          oboeBus(NODE_DROP).on(function () {

            var oldHead = head(ascent),
                key = keyOf(oldHead),
                ancestors = tail(ascent),
                parentNode;

            if (ancestors) {
              parentNode = nodeOf(head(ancestors));

              delete parentNode[key];
            }
          });

          oboeBus(ABORTING).on(function () {

            for (var eventName in handlers) {
              oboeBus(eventName).un(listenerId);
            }
          });
        }

        // based on gist https://gist.github.com/monsur/706839

        /**
         * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
         * headers according to the format described here:
         * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
         * This method parses that string into a user-friendly key/value pair object.
         */
        function parseResponseHeaders(headerStr) {
          var headers = {};

          headerStr && headerStr.split("\r\n").forEach(function (headerPair) {

            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf(": ");

            headers[headerPair.substring(0, index)] = headerPair.substring(index + 2);
          });

          return headers;
        }

        /**
         * Detect if a given URL is cross-origin in the scope of the
         * current page.
         * 
         * Browser only (since cross-origin has no meaning in Node.js)
         *
         * @param {Object} pageLocation - as in window.location
         * @param {Object} ajaxHost - an object like window.location describing the 
         *    origin of the url that we want to ajax in
         */
        function isCrossOrigin(pageLocation, ajaxHost) {

          /*
           * NB: defaultPort only knows http and https.
           * Returns undefined otherwise.
           */
          function defaultPort(protocol) {
            return { 'http:': 80, 'https:': 443 }[protocol];
          }

          function portOf(location) {
            // pageLocation should always have a protocol. ajaxHost if no port or
            // protocol is specified, should use the port of the containing page

            return location.port || defaultPort(location.protocol || pageLocation.protocol);
          }

          // if ajaxHost doesn't give a domain, port is the same as pageLocation
          // it can't give a protocol but not a domain
          // it can't give a port but not a domain

          return !!(ajaxHost.protocol && ajaxHost.protocol != pageLocation.protocol || ajaxHost.host && ajaxHost.host != pageLocation.host || ajaxHost.host && portOf(ajaxHost) != portOf(pageLocation));
        }

        /* turn any url into an object like window.location */
        function parseUrlOrigin(url) {
          // url could be domain-relative
          // url could give a domain

          // cross origin means:
          //    same domain
          //    same port
          //    some protocol
          // so, same everything up to the first (single) slash 
          // if such is given
          //
          // can ignore everything after that   

          var URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/,


          // if no match, use an empty array so that
          // subexpressions 1,2,3 are all undefined
          // and will ultimately return all empty
          // strings as the parse result:
          urlHostMatch = URL_HOST_PATTERN.exec(url) || [];

          return {
            protocol: urlHostMatch[1] || '',
            host: urlHostMatch[2] || '',
            port: urlHostMatch[3] || ''
          };
        }

        function httpTransport() {
          return new XMLHttpRequest();
        }

        /**
         * A wrapper around the browser XmlHttpRequest object that raises an 
         * event whenever a new part of the response is available.
         * 
         * In older browsers progressive reading is impossible so all the 
         * content is given in a single call. For newer ones several events
         * should be raised, allowing progressive interpretation of the response.
         *      
         * @param {Function} oboeBus an event bus local to this Oboe instance
         * @param {XMLHttpRequest} xhr the xhr to use as the transport. Under normal
         *          operation, will have been created using httpTransport() above
         *          but for tests a stub can be provided instead.
         * @param {String} method one of 'GET' 'POST' 'PUT' 'PATCH' 'DELETE'
         * @param {String} url the url to make a request to
         * @param {String|Null} data some content to be sent with the request.
         *                      Only valid if method is POST or PUT.
         * @param {Object} [headers] the http request headers to send
         * @param {boolean} withCredentials the XHR withCredentials property will be
         *    set to this value
         */
        function streamingHttp(oboeBus, xhr, method, url, data, headers, withCredentials) {

          "use strict";

          var emitStreamData = oboeBus(STREAM_DATA).emit,
              emitFail = oboeBus(FAIL_EVENT).emit,
              numberOfCharsAlreadyGivenToCallback = 0,
              stillToSendStartEvent = true;

          // When an ABORTING message is put on the event bus abort 
          // the ajax request         
          oboeBus(ABORTING).on(function () {

            // if we keep the onreadystatechange while aborting the XHR gives 
            // a callback like a successful call so first remove this listener
            // by assigning null:
            xhr.onreadystatechange = null;

            xhr.abort();
          });

          /** 
           * Handle input from the underlying xhr: either a state change,
           * the progress event or the request being complete.
           */
          function handleProgress() {

            var textSoFar = xhr.responseText,
                newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);

            /* Raise the event for new text.
            
               On older browsers, the new text is the whole response. 
               On newer/better ones, the fragment part that we got since 
               last progress. */

            if (newText) {
              emitStreamData(newText);
            }

            numberOfCharsAlreadyGivenToCallback = len(textSoFar);
          }

          if ('onprogress' in xhr) {
            // detect browser support for progressive delivery
            xhr.onprogress = handleProgress;
          }

          xhr.onreadystatechange = function () {

            function sendStartIfNotAlready() {
              // Internet Explorer is very unreliable as to when xhr.status etc can
              // be read so has to be protected with try/catch and tried again on 
              // the next readyState if it fails
              try {
                stillToSendStartEvent && oboeBus(HTTP_START).emit(xhr.status, parseResponseHeaders(xhr.getAllResponseHeaders()));
                stillToSendStartEvent = false;
              } catch (e) {/* do nothing, will try again on next readyState*/}
            }

            switch (xhr.readyState) {

              case 2: // HEADERS_RECEIVED
              case 3:
                // LOADING
                return sendStartIfNotAlready();

              case 4:
                // DONE
                sendStartIfNotAlready(); // if xhr.status hasn't been available yet, it must be NOW, huh IE?

                // is this a 2xx http code?
                var successful = String(xhr.status)[0] == 2;

                if (successful) {
                  // In Chrome 29 (not 28) no onprogress is emitted when a response
                  // is complete before the onload. We need to always do handleInput
                  // in case we get the load but have not had a final progress event.
                  // This looks like a bug and may change in future but let's take
                  // the safest approach and assume we might not have received a 
                  // progress event for each part of the response
                  handleProgress();

                  oboeBus(STREAM_END).emit();
                } else {

                  emitFail(errorReport(xhr.status, xhr.responseText));
                }
            }
          };

          try {

            xhr.open(method, url, true);

            for (var headerName in headers) {
              xhr.setRequestHeader(headerName, headers[headerName]);
            }

            if (!isCrossOrigin(window.location, parseUrlOrigin(url))) {
              xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            }

            xhr.withCredentials = withCredentials;

            xhr.send(data);
          } catch (e) {

            // To keep a consistent interface with Node, we can't emit an event here.
            // Node's streaming http adaptor receives the error as an asynchronous
            // event rather than as an exception. If we emitted now, the Oboe user
            // has had no chance to add a .fail listener so there is no way
            // the event could be useful. For both these reasons defer the
            // firing to the next JS frame.  
            window.setTimeout(partialComplete(emitFail, errorReport(undefined, undefined, e)), 0);
          }
        }

        var jsonPathSyntax = function () {

          var

          /** 
           * Export a regular expression as a simple function by exposing just 
           * the Regex#exec. This allows regex tests to be used under the same 
           * interface as differently implemented tests, or for a user of the
           * tests to not concern themselves with their implementation as regular
           * expressions.
           * 
           * This could also be expressed point-free as:
           *   Function.prototype.bind.bind(RegExp.prototype.exec),
           *   
           * But that's far too confusing! (and not even smaller once minified 
           * and gzipped)
           */
          regexDescriptor = function regexDescriptor(regex) {
            return regex.exec.bind(regex);
          }

          /**
           * Join several regular expressions and express as a function.
           * This allows the token patterns to reuse component regular expressions
           * instead of being expressed in full using huge and confusing regular
           * expressions.
           */
          ,
              jsonPathClause = varArgs(function (componentRegexes) {

            // The regular expressions all start with ^ because we 
            // only want to find matches at the start of the 
            // JSONPath fragment we are inspecting           
            componentRegexes.unshift(/^/);

            return regexDescriptor(RegExp(componentRegexes.map(attr('source')).join('')));
          }),
              possiblyCapturing = /(\$?)/,
              namedNode = /([\w-_]+|\*)/,
              namePlaceholder = /()/,
              nodeInArrayNotation = /\["([^"]+)"\]/,
              numberedNodeInArrayNotation = /\[(\d+|\*)\]/,
              fieldList = /{([\w ]*?)}/,
              optionalFieldList = /(?:{([\w ]*?)})?/

          //   foo or *                  
          ,
              jsonPathNamedNodeInObjectNotation = jsonPathClause(possiblyCapturing, namedNode, optionalFieldList)

          //   ["foo"]   
          ,
              jsonPathNamedNodeInArrayNotation = jsonPathClause(possiblyCapturing, nodeInArrayNotation, optionalFieldList)

          //   [2] or [*]       
          ,
              jsonPathNumberedNodeInArrayNotation = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation, optionalFieldList)

          //   {a b c}      
          ,
              jsonPathPureDuckTyping = jsonPathClause(possiblyCapturing, namePlaceholder, fieldList)

          //   ..
          ,
              jsonPathDoubleDot = jsonPathClause(/\.\./)

          //   .
          ,
              jsonPathDot = jsonPathClause(/\./)

          //   !
          ,
              jsonPathBang = jsonPathClause(possiblyCapturing, /!/)

          //   nada!
          ,
              emptyString = jsonPathClause(/$/);

          /* We export only a single function. When called, this function injects 
             into another function the descriptors from above.             
           */
          return function (fn) {
            return fn(lazyUnion(jsonPathNamedNodeInObjectNotation, jsonPathNamedNodeInArrayNotation, jsonPathNumberedNodeInArrayNotation, jsonPathPureDuckTyping), jsonPathDoubleDot, jsonPathDot, jsonPathBang, emptyString);
          };
        }();
        /**
         * Get a new key->node mapping
         * 
         * @param {String|Number} key
         * @param {Object|Array|String|Number|null} node a value found in the json
         */
        function namedNode(key, node) {
          return { key: key, node: node };
        }

        /** get the key of a namedNode */
        var keyOf = attr('key');

        /** get the node from a namedNode */
        var nodeOf = attr('node');
        /** 
         * This file provides various listeners which can be used to build up
         * a changing ascent based on the callbacks provided by Clarinet. It listens
         * to the low-level events from Clarinet and emits higher-level ones.
         *  
         * The building up is stateless so to track a JSON file
         * ascentManager.js is required to store the ascent state
         * between calls.
         */

        /** 
         * A special value to use in the path list to represent the path 'to' a root 
         * object (which doesn't really have any path). This prevents the need for 
         * special-casing detection of the root object and allows it to be treated 
         * like any other object. We might think of this as being similar to the 
         * 'unnamed root' domain ".", eg if I go to 
         * http://en.wikipedia.org./wiki/En/Main_page the dot after 'org' deliminates 
         * the unnamed root of the DNS.
         * 
         * This is kept as an object to take advantage that in Javascript's OO objects 
         * are guaranteed to be distinct, therefore no other object can possibly clash 
         * with this one. Strings, numbers etc provide no such guarantee. 
         **/
        var ROOT_PATH = {};

        /**
         * Create a new set of handlers for clarinet's events, bound to the emit 
         * function given.  
         */
        function incrementalContentBuilder(oboeBus) {

          var emitNodeOpened = oboeBus(NODE_OPENED).emit,
              emitNodeClosed = oboeBus(NODE_CLOSED).emit,
              emitRootOpened = oboeBus(ROOT_PATH_FOUND).emit,
              emitRootClosed = oboeBus(ROOT_NODE_FOUND).emit;

          function arrayIndicesAreKeys(possiblyInconsistentAscent, newDeepestNode) {

            /* for values in arrays we aren't pre-warned of the coming paths 
               (Clarinet gives no call to onkey like it does for values in objects) 
               so if we are in an array we need to create this path ourselves. The 
               key will be len(parentNode) because array keys are always sequential 
               numbers. */

            var parentNode = nodeOf(head(possiblyInconsistentAscent));

            return isOfType(Array, parentNode) ? keyFound(possiblyInconsistentAscent, len(parentNode), newDeepestNode) :
            // nothing needed, return unchanged
            possiblyInconsistentAscent;
          }

          function nodeOpened(ascent, newDeepestNode) {

            if (!ascent) {
              // we discovered the root node,         
              emitRootOpened(newDeepestNode);

              return keyFound(ascent, ROOT_PATH, newDeepestNode);
            }

            // we discovered a non-root node

            var arrayConsistentAscent = arrayIndicesAreKeys(ascent, newDeepestNode),
                ancestorBranches = tail(arrayConsistentAscent),
                previouslyUnmappedName = keyOf(head(arrayConsistentAscent));

            appendBuiltContent(ancestorBranches, previouslyUnmappedName, newDeepestNode);

            return cons(namedNode(previouslyUnmappedName, newDeepestNode), ancestorBranches);
          }

          /**
           * Add a new value to the object we are building up to represent the
           * parsed JSON
           */
          function appendBuiltContent(ancestorBranches, key, node) {

            nodeOf(head(ancestorBranches))[key] = node;
          }

          /**
           * For when we find a new key in the json.
           * 
           * @param {String|Number|Object} newDeepestName the key. If we are in an 
           *    array will be a number, otherwise a string. May take the special 
           *    value ROOT_PATH if the root node has just been found
           *    
           * @param {String|Number|Object|Array|Null|undefined} [maybeNewDeepestNode] 
           *    usually this won't be known so can be undefined. Can't use null 
           *    to represent unknown because null is a valid value in JSON
           **/
          function keyFound(ascent, newDeepestName, maybeNewDeepestNode) {

            if (ascent) {
              // if not root

              // If we have the key but (unless adding to an array) no known value
              // yet. Put that key in the output but against no defined value:      
              appendBuiltContent(ascent, newDeepestName, maybeNewDeepestNode);
            }

            var ascentWithNewPath = cons(namedNode(newDeepestName, maybeNewDeepestNode), ascent);

            emitNodeOpened(ascentWithNewPath);

            return ascentWithNewPath;
          }

          /**
           * For when the current node ends.
           */
          function nodeClosed(ascent) {

            emitNodeClosed(ascent);

            return tail(ascent) ||
            // If there are no nodes left in the ascent the root node
            // just closed. Emit a special event for this: 
            emitRootClosed(nodeOf(head(ascent)));
          }

          var contentBuilderHandlers = {};
          contentBuilderHandlers[SAX_VALUE_OPEN] = nodeOpened;
          contentBuilderHandlers[SAX_VALUE_CLOSE] = nodeClosed;
          contentBuilderHandlers[SAX_KEY] = keyFound;
          return contentBuilderHandlers;
        }

        /**
         * The jsonPath evaluator compiler used for Oboe.js. 
         * 
         * One function is exposed. This function takes a String JSONPath spec and 
         * returns a function to test candidate ascents for matches.
         * 
         *  String jsonPath -> (List ascent) -> Boolean|Object
         *
         * This file is coded in a pure functional style. That is, no function has 
         * side effects, every function evaluates to the same value for the same 
         * arguments and no variables are reassigned.
         */
        // the call to jsonPathSyntax injects the token syntaxes that are needed 
        // inside the compiler
        var jsonPathCompiler = jsonPathSyntax(function (pathNodeSyntax, doubleDotSyntax, dotSyntax, bangSyntax, emptySyntax) {

          var CAPTURING_INDEX = 1;
          var NAME_INDEX = 2;
          var FIELD_LIST_INDEX = 3;

          var headKey = compose2(keyOf, head),
              headNode = compose2(nodeOf, head);

          /**
           * Create an evaluator function for a named path node, expressed in the
           * JSONPath like:
           *    foo
           *    ["bar"]
           *    [2]   
           */
          function nameClause(previousExpr, detection) {

            var name = detection[NAME_INDEX],
                matchesName = !name || name == '*' ? always : function (ascent) {
              return headKey(ascent) == name;
            };

            return lazyIntersection(matchesName, previousExpr);
          }

          /**
           * Create an evaluator function for a a duck-typed node, expressed like:
           * 
           *    {spin, taste, colour}
           *    .particle{spin, taste, colour}
           *    *{spin, taste, colour}
           */
          function duckTypeClause(previousExpr, detection) {

            var fieldListStr = detection[FIELD_LIST_INDEX];

            if (!fieldListStr) return previousExpr; // don't wrap at all, return given expr as-is      

            var hasAllrequiredFields = partialComplete(hasAllProperties, arrayAsList(fieldListStr.split(/\W+/))),
                isMatch = compose2(hasAllrequiredFields, headNode);

            return lazyIntersection(isMatch, previousExpr);
          }

          /**
           * Expression for $, returns the evaluator function
           */
          function capture(previousExpr, detection) {

            // extract meaning from the detection      
            var capturing = !!detection[CAPTURING_INDEX];

            if (!capturing) return previousExpr; // don't wrap at all, return given expr as-is      

            return lazyIntersection(previousExpr, head);
          }

          /**
           * Create an evaluator function that moves onto the next item on the 
           * lists. This function is the place where the logic to move up a 
           * level in the ascent exists. 
           * 
           * Eg, for JSONPath ".foo" we need skip1(nameClause(always, [,'foo']))
           */
          function skip1(previousExpr) {

            if (previousExpr == always) {
              /* If there is no previous expression this consume command 
                 is at the start of the jsonPath.
                 Since JSONPath specifies what we'd like to find but not 
                 necessarily everything leading down to it, when running
                 out of JSONPath to check against we default to true */
              return always;
            }

            /** return true if the ascent we have contains only the JSON root,
             *  false otherwise
             */
            function notAtRoot(ascent) {
              return headKey(ascent) != ROOT_PATH;
            }

            return lazyIntersection(
            /* If we're already at the root but there are more 
               expressions to satisfy, can't consume any more. No match.
                This check is why none of the other exprs have to be able 
               to handle empty lists; skip1 is the only evaluator that 
               moves onto the next token and it refuses to do so once it 
               reaches the last item in the list. */
            notAtRoot,

            /* We are not at the root of the ascent yet.
               Move to the next level of the ascent by handing only 
               the tail to the previous expression */
            compose2(previousExpr, tail));
          }

          /**
           * Create an evaluator function for the .. (double dot) token. Consumes
           * zero or more levels of the ascent, the fewest that are required to find
           * a match when given to previousExpr.
           */
          function skipMany(previousExpr) {

            if (previousExpr == always) {
              /* If there is no previous expression this consume command 
                 is at the start of the jsonPath.
                 Since JSONPath specifies what we'd like to find but not 
                 necessarily everything leading down to it, when running
                 out of JSONPath to check against we default to true */
              return always;
            }

            var
            // In JSONPath .. is equivalent to !.. so if .. reaches the root
            // the match has succeeded. Ie, we might write ..foo or !..foo
            // and both should match identically.
            terminalCaseWhenArrivingAtRoot = rootExpr(),
                terminalCaseWhenPreviousExpressionIsSatisfied = previousExpr,
                recursiveCase = skip1(function (ascent) {
              return cases(ascent);
            }),
                cases = lazyUnion(terminalCaseWhenArrivingAtRoot, terminalCaseWhenPreviousExpressionIsSatisfied, recursiveCase);

            return cases;
          }

          /**
           * Generate an evaluator for ! - matches only the root element of the json
           * and ignores any previous expressions since nothing may precede !. 
           */
          function rootExpr() {

            return function (ascent) {
              return headKey(ascent) == ROOT_PATH;
            };
          }

          /**
           * Generate a statement wrapper to sit around the outermost 
           * clause evaluator.
           * 
           * Handles the case where the capturing is implicit because the JSONPath
           * did not contain a '$' by returning the last node.
           */
          function statementExpr(lastClause) {

            return function (ascent) {

              // kick off the evaluation by passing through to the last clause
              var exprMatch = lastClause(ascent);

              return exprMatch === true ? head(ascent) : exprMatch;
            };
          }

          /**
           * For when a token has been found in the JSONPath input.
           * Compiles the parser for that token and returns in combination with the
           * parser already generated.
           * 
           * @param {Function} exprs  a list of the clause evaluator generators for
           *                          the token that was found
           * @param {Function} parserGeneratedSoFar the parser already found
           * @param {Array} detection the match given by the regex engine when 
           *                          the feature was found
           */
          function expressionsReader(exprs, parserGeneratedSoFar, detection) {

            // if exprs is zero-length foldR will pass back the 
            // parserGeneratedSoFar as-is so we don't need to treat 
            // this as a special case

            return foldR(function (parserGeneratedSoFar, expr) {

              return expr(parserGeneratedSoFar, detection);
            }, parserGeneratedSoFar, exprs);
          }

          /** 
           *  If jsonPath matches the given detector function, creates a function which
           *  evaluates against every clause in the clauseEvaluatorGenerators. The
           *  created function is propagated to the onSuccess function, along with
           *  the remaining unparsed JSONPath substring.
           *  
           *  The intended use is to create a clauseMatcher by filling in
           *  the first two arguments, thus providing a function that knows
           *  some syntax to match and what kind of generator to create if it
           *  finds it. The parameter list once completed is:
           *  
           *    (jsonPath, parserGeneratedSoFar, onSuccess)
           *  
           *  onSuccess may be compileJsonPathToFunction, to recursively continue 
           *  parsing after finding a match or returnFoundParser to stop here.
           */
          function generateClauseReaderIfTokenFound(tokenDetector, clauseEvaluatorGenerators, jsonPath, parserGeneratedSoFar, onSuccess) {

            var detected = tokenDetector(jsonPath);

            if (detected) {
              var compiledParser = expressionsReader(clauseEvaluatorGenerators, parserGeneratedSoFar, detected),
                  remainingUnparsedJsonPath = jsonPath.substr(len(detected[0]));

              return onSuccess(remainingUnparsedJsonPath, compiledParser);
            }
          }

          /**
           * Partially completes generateClauseReaderIfTokenFound above. 
           */
          function clauseMatcher(tokenDetector, exprs) {

            return partialComplete(generateClauseReaderIfTokenFound, tokenDetector, exprs);
          }

          /**
           * clauseForJsonPath is a function which attempts to match against 
           * several clause matchers in order until one matches. If non match the
           * jsonPath expression is invalid and an error is thrown.
           * 
           * The parameter list is the same as a single clauseMatcher:
           * 
           *    (jsonPath, parserGeneratedSoFar, onSuccess)
           */
          var clauseForJsonPath = lazyUnion(clauseMatcher(pathNodeSyntax, list(capture, duckTypeClause, nameClause, skip1)), clauseMatcher(doubleDotSyntax, list(skipMany))

          // dot is a separator only (like whitespace in other languages) but 
          // rather than make it a special case, use an empty list of 
          // expressions when this token is found
          , clauseMatcher(dotSyntax, list()), clauseMatcher(bangSyntax, list(capture, rootExpr)), clauseMatcher(emptySyntax, list(statementExpr)), function (jsonPath) {
            throw Error('"' + jsonPath + '" could not be tokenised');
          });

          /**
           * One of two possible values for the onSuccess argument of 
           * generateClauseReaderIfTokenFound.
           * 
           * When this function is used, generateClauseReaderIfTokenFound simply 
           * returns the compiledParser that it made, regardless of if there is 
           * any remaining jsonPath to be compiled.
           */
          function returnFoundParser(_remainingJsonPath, compiledParser) {
            return compiledParser;
          }

          /**
           * Recursively compile a JSONPath expression.
           * 
           * This function serves as one of two possible values for the onSuccess 
           * argument of generateClauseReaderIfTokenFound, meaning continue to
           * recursively compile. Otherwise, returnFoundParser is given and
           * compilation terminates.
           */
          function compileJsonPathToFunction(uncompiledJsonPath, parserGeneratedSoFar) {

            /**
             * On finding a match, if there is remaining text to be compiled
             * we want to either continue parsing using a recursive call to 
             * compileJsonPathToFunction. Otherwise, we want to stop and return 
             * the parser that we have found so far.
             */
            var onFind = uncompiledJsonPath ? compileJsonPathToFunction : returnFoundParser;

            return clauseForJsonPath(uncompiledJsonPath, parserGeneratedSoFar, onFind);
          }

          /**
           * This is the function that we expose to the rest of the library.
           */
          return function (jsonPath) {

            try {
              // Kick off the recursive parsing of the jsonPath 
              return compileJsonPathToFunction(jsonPath, always);
            } catch (e) {
              throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
            }
          };
        });

        /**
         * A pub/sub which is responsible for a single event type. A
         * multi-event type event bus is created by pubSub by collecting
         * several of these.
         *
         * @param {String} eventType
         *    the name of the events managed by this singleEventPubSub
         * @param {singleEventPubSub} [newListener]
         *    place to notify of new listeners
         * @param {singleEventPubSub} [removeListener]
         *    place to notify of when listeners are removed
         */
        function singleEventPubSub(eventType, newListener, removeListener) {

          /** we are optimised for emitting events over firing them.
           *  As well as the tuple list which stores event ids and
           *  listeners there is a list with just the listeners which
           *  can be iterated more quickly when we are emitting
           */
          var listenerTupleList, listenerList;

          function hasId(id) {
            return function (tuple) {
              return tuple.id == id;
            };
          }

          return {

            /**
             * @param {Function} listener
             * @param {*} listenerId
             *    an id that this listener can later by removed by.
             *    Can be of any type, to be compared to other ids using ==
             */
            on: function on(listener, listenerId) {

              var tuple = {
                listener: listener,
                id: listenerId || listener // when no id is given use the
                // listener function as the id
              };

              if (newListener) {
                newListener.emit(eventType, listener, tuple.id);
              }

              listenerTupleList = cons(tuple, listenerTupleList);
              listenerList = cons(listener, listenerList);

              return this; // chaining
            },

            emit: function emit() {
              applyEach(listenerList, arguments);
            },

            un: function un(listenerId) {

              var removed;

              listenerTupleList = without(listenerTupleList, hasId(listenerId), function (tuple) {
                removed = tuple;
              });

              if (removed) {
                listenerList = without(listenerList, function (listener) {
                  return listener == removed.listener;
                });

                if (removeListener) {
                  removeListener.emit(eventType, removed.listener, removed.id);
                }
              }
            },

            listeners: function listeners() {
              // differs from Node EventEmitter: returns list, not array
              return listenerList;
            },

            hasListener: function hasListener(listenerId) {
              var test = listenerId ? hasId(listenerId) : always;

              return defined(first(test, listenerTupleList));
            }
          };
        }

        /**
         * pubSub is a curried interface for listening to and emitting
         * events.
         *
         * If we get a bus:
         *
         *    var bus = pubSub();
         *
         * We can listen to event 'foo' like:
         *
         *    bus('foo').on(myCallback)
         *
         * And emit event foo like:
         *
         *    bus('foo').emit()
         *
         * or, with a parameter:
         *
         *    bus('foo').emit('bar')
         *
         * All functions can be cached and don't need to be
         * bound. Ie:
         *
         *    var fooEmitter = bus('foo').emit
         *    fooEmitter('bar');  // emit an event
         *    fooEmitter('baz');  // emit another
         *
         * There's also an uncurried[1] shortcut for .emit and .on:
         *
         *    bus.on('foo', callback)
         *    bus.emit('foo', 'bar')
         *
         * [1]: http://zvon.org/other/haskell/Outputprelude/uncurry_f.html
         */
        function pubSub() {

          var singles = {},
              newListener = newSingle('newListener'),
              removeListener = newSingle('removeListener');

          function newSingle(eventName) {
            return singles[eventName] = singleEventPubSub(eventName, newListener, removeListener);
          }

          /** pubSub instances are functions */
          function pubSubInstance(eventName) {

            return singles[eventName] || newSingle(eventName);
          }

          // add convenience EventEmitter-style uncurried form of 'emit' and 'on'
          ['emit', 'on', 'un'].forEach(function (methodName) {

            pubSubInstance[methodName] = varArgs(function (eventName, parameters) {
              apply(parameters, pubSubInstance(eventName)[methodName]);
            });
          });

          return pubSubInstance;
        }

        /**
         * This file declares some constants to use as names for event types.
         */

        var // the events which are never exported are kept as 
        // the smallest possible representation, in numbers:
        _S = 1,


        // fired whenever a new node starts in the JSON stream:
        NODE_OPENED = _S++,


        // fired whenever a node closes in the JSON stream:
        NODE_CLOSED = _S++,


        // called if a .node callback returns a value - 
        NODE_SWAP = _S++,
            NODE_DROP = _S++,
            FAIL_EVENT = 'fail',
            ROOT_NODE_FOUND = _S++,
            ROOT_PATH_FOUND = _S++,
            HTTP_START = 'start',
            STREAM_DATA = 'data',
            STREAM_END = 'end',
            ABORTING = _S++,


        // SAX events butchered from Clarinet
        SAX_KEY = _S++,
            SAX_VALUE_OPEN = _S++,
            SAX_VALUE_CLOSE = _S++;

        function errorReport(statusCode, body, error) {
          try {
            var jsonBody = JSON.parse(body);
          } catch (e) {}

          return {
            statusCode: statusCode,
            body: body,
            jsonBody: jsonBody,
            thrown: error
          };
        }

        /** 
         *  The pattern adaptor listens for newListener and removeListener
         *  events. When patterns are added or removed it compiles the JSONPath
         *  and wires them up.
         *  
         *  When nodes and paths are found it emits the fully-qualified match 
         *  events with parameters ready to ship to the outside world
         */

        function patternAdapter(oboeBus, jsonPathCompiler) {

          var predicateEventMap = {
            node: oboeBus(NODE_CLOSED),
            path: oboeBus(NODE_OPENED)
          };

          function emitMatchingNode(emitMatch, node, ascent) {

            /* 
               We're now calling to the outside world where Lisp-style 
               lists will not be familiar. Convert to standard arrays. 
                   Also, reverse the order because it is more common to 
               list paths "root to leaf" than "leaf to root"  */
            var descent = reverseList(ascent);

            emitMatch(node,

            // To make a path, strip off the last item which is the special
            // ROOT_PATH token for the 'path' to the root node          
            listAsArray(tail(map(keyOf, descent))), // path
            listAsArray(map(nodeOf, descent)) // ancestors    
            );
          }

          /* 
           * Set up the catching of events such as NODE_CLOSED and NODE_OPENED and, if 
           * matching the specified pattern, propagate to pattern-match events such as 
           * oboeBus('node:!')
           * 
           * 
           * 
           * @param {Function} predicateEvent 
           *          either oboeBus(NODE_CLOSED) or oboeBus(NODE_OPENED).
           * @param {Function} compiledJsonPath          
           */
          function addUnderlyingListener(fullEventName, predicateEvent, compiledJsonPath) {

            var emitMatch = oboeBus(fullEventName).emit;

            predicateEvent.on(function (ascent) {

              var maybeMatchingMapping = compiledJsonPath(ascent);

              /* Possible values for maybeMatchingMapping are now:
                false: 
               we did not match 
                an object/array/string/number/null: 
               we matched and have the node that matched.
               Because nulls are valid json values this can be null.
                undefined:
               we matched but don't have the matching node yet.
               ie, we know there is an upcoming node that matches but we 
               can't say anything else about it. 
               */
              if (maybeMatchingMapping !== false) {

                emitMatchingNode(emitMatch, nodeOf(maybeMatchingMapping), ascent);
              }
            }, fullEventName);

            oboeBus('removeListener').on(function (removedEventName) {

              // if the fully qualified match event listener is later removed, clean up 
              // by removing the underlying listener if it was the last using that pattern:

              if (removedEventName == fullEventName) {

                if (!oboeBus(removedEventName).listeners()) {
                  predicateEvent.un(fullEventName);
                }
              }
            });
          }

          oboeBus('newListener').on(function (fullEventName) {

            var match = /(node|path):(.*)/.exec(fullEventName);

            if (match) {
              var predicateEvent = predicateEventMap[match[1]];

              if (!predicateEvent.hasListener(fullEventName)) {

                addUnderlyingListener(fullEventName, predicateEvent, jsonPathCompiler(match[2]));
              }
            }
          });
        }

        /**
         * The instance API is the thing that is returned when oboe() is called.
         * it allows:
         *
         *    - listeners for various events to be added and removed
         *    - the http response header/headers to be read
         */
        function instanceApi(oboeBus, contentSource) {

          var oboeApi,
              fullyQualifiedNamePattern = /^(node|path):./,
              rootNodeFinishedEvent = oboeBus(ROOT_NODE_FOUND),
              emitNodeDrop = oboeBus(NODE_DROP).emit,
              emitNodeSwap = oboeBus(NODE_SWAP).emit,


          /**
           * Add any kind of listener that the instance api exposes
           */
          addListener = varArgs(function (eventId, parameters) {

            if (oboeApi[eventId]) {

              // for events added as .on(event, callback), if there is a
              // .event() equivalent with special behaviour , pass through
              // to that:
              apply(parameters, oboeApi[eventId]);
            } else {

              // we have a standard Node.js EventEmitter 2-argument call.
              // The first parameter is the listener.
              var event = oboeBus(eventId),
                  listener = parameters[0];

              if (fullyQualifiedNamePattern.test(eventId)) {

                // allow fully-qualified node/path listeners
                // to be added
                addForgettableCallback(event, listener);
              } else {

                // the event has no special handling, pass through
                // directly onto the event bus:
                event.on(listener);
              }
            }

            return oboeApi; // chaining
          }),


          /**
           * Remove any kind of listener that the instance api exposes
           */
          removeListener = function removeListener(eventId, p2, p3) {

            if (eventId == 'done') {

              rootNodeFinishedEvent.un(p2);
            } else if (eventId == 'node' || eventId == 'path') {

              // allow removal of node and path
              oboeBus.un(eventId + ':' + p2, p3);
            } else {

              // we have a standard Node.js EventEmitter 2-argument call.
              // The second parameter is the listener. This may be a call
              // to remove a fully-qualified node/path listener but requires
              // no special handling
              var listener = p2;

              oboeBus(eventId).un(listener);
            }

            return oboeApi; // chaining
          };

          /**
           * Add a callback, wrapped in a try/catch so as to not break the
           * execution of Oboe if an exception is thrown (fail events are
           * fired instead)
           *
           * The callback is used as the listener id so that it can later be
           * removed using .un(callback)
           */
          function addProtectedCallback(eventName, callback) {
            oboeBus(eventName).on(protectedCallback(callback), callback);
            return oboeApi; // chaining
          }

          /**
           * Add a callback where, if .forget() is called during the callback's
           * execution, the callback will be de-registered
           */
          function addForgettableCallback(event, callback, listenerId) {

            // listenerId is optional and if not given, the original
            // callback will be used
            listenerId = listenerId || callback;

            var safeCallback = protectedCallback(callback);

            event.on(function () {

              var discard = false;

              oboeApi.forget = function () {
                discard = true;
              };

              apply(arguments, safeCallback);

              delete oboeApi.forget;

              if (discard) {
                event.un(listenerId);
              }
            }, listenerId);

            return oboeApi; // chaining
          }

          /**
           *  wrap a callback so that if it throws, Oboe.js doesn't crash but instead
           *  throw the error in another event loop
           */
          function protectedCallback(callback) {
            return function () {
              try {
                return callback.apply(oboeApi, arguments);
              } catch (e) {
                setTimeout(function () {
                  throw new Error(e.message);
                });
              }
            };
          }

          /**
           * Return the fully qualified event for when a pattern matches
           * either a node or a path
           *
           * @param type {String} either 'node' or 'path'
           */
          function fullyQualifiedPatternMatchEvent(type, pattern) {
            return oboeBus(type + ':' + pattern);
          }

          function wrapCallbackToSwapNodeIfSomethingReturned(callback) {
            return function () {
              var returnValueFromCallback = callback.apply(this, arguments);

              if (defined(returnValueFromCallback)) {

                if (returnValueFromCallback == oboe.drop) {
                  emitNodeDrop();
                } else {
                  emitNodeSwap(returnValueFromCallback);
                }
              }
            };
          }

          function addSingleNodeOrPathListener(eventId, pattern, callback) {

            var effectiveCallback;

            if (eventId == 'node') {
              effectiveCallback = wrapCallbackToSwapNodeIfSomethingReturned(callback);
            } else {
              effectiveCallback = callback;
            }

            addForgettableCallback(fullyQualifiedPatternMatchEvent(eventId, pattern), effectiveCallback, callback);
          }

          /**
           * Add several listeners at a time, from a map
           */
          function addMultipleNodeOrPathListeners(eventId, listenerMap) {

            for (var pattern in listenerMap) {
              addSingleNodeOrPathListener(eventId, pattern, listenerMap[pattern]);
            }
          }

          /**
           * implementation behind .onPath() and .onNode()
           */
          function addNodeOrPathListenerApi(eventId, jsonPathOrListenerMap, callback) {

            if (isString(jsonPathOrListenerMap)) {
              addSingleNodeOrPathListener(eventId, jsonPathOrListenerMap, callback);
            } else {
              addMultipleNodeOrPathListeners(eventId, jsonPathOrListenerMap);
            }

            return oboeApi; // chaining
          }

          // some interface methods are only filled in after we receive
          // values and are noops before that:
          oboeBus(ROOT_PATH_FOUND).on(function (rootNode) {
            oboeApi.root = functor(rootNode);
          });

          /**
           * When content starts make the headers readable through the
           * instance API
           */
          oboeBus(HTTP_START).on(function (_statusCode, headers) {

            oboeApi.header = function (name) {
              return name ? headers[name] : headers;
            };
          });

          /**
           * Construct and return the public API of the Oboe instance to be
           * returned to the calling application
           */
          return oboeApi = {
            on: addListener,
            addListener: addListener,
            removeListener: removeListener,
            emit: oboeBus.emit,

            node: partialComplete(addNodeOrPathListenerApi, 'node'),
            path: partialComplete(addNodeOrPathListenerApi, 'path'),

            done: partialComplete(addForgettableCallback, rootNodeFinishedEvent),
            start: partialComplete(addProtectedCallback, HTTP_START),

            // fail doesn't use protectedCallback because
            // could lead to non-terminating loops
            fail: oboeBus(FAIL_EVENT).on,

            // public api calling abort fires the ABORTING event
            abort: oboeBus(ABORTING).emit,

            // initially return nothing for header and root
            header: noop,
            root: noop,

            source: contentSource
          };
        }

        /**
         * This file sits just behind the API which is used to attain a new
         * Oboe instance. It creates the new components that are required
         * and introduces them to each other.
         */

        function wire(httpMethodName, contentSource, body, headers, withCredentials) {

          var oboeBus = pubSub();

          // Wire the input stream in if we are given a content source.
          // This will usually be the case. If not, the instance created
          // will have to be passed content from an external source.

          if (contentSource) {

            streamingHttp(oboeBus, httpTransport(), httpMethodName, contentSource, body, headers, withCredentials);
          }

          clarinet(oboeBus);

          ascentManager(oboeBus, incrementalContentBuilder(oboeBus));

          patternAdapter(oboeBus, jsonPathCompiler);

          return instanceApi(oboeBus, contentSource);
        }

        function applyDefaults(passthrough, url, httpMethodName, body, headers, withCredentials, cached) {

          headers = headers ?
          // Shallow-clone the headers array. This allows it to be
          // modified without side effects to the caller. We don't
          // want to change objects that the user passes in.
          JSON.parse(JSON.stringify(headers)) : {};

          if (body) {
            if (!isString(body)) {

              // If the body is not a string, stringify it. This allows objects to
              // be given which will be sent as JSON.
              body = JSON.stringify(body);

              // Default Content-Type to JSON unless given otherwise.
              headers['Content-Type'] = headers['Content-Type'] || 'application/json';
            }
            headers['Content-Length'] = headers['Content-Length'] || body.length;
          } else {
            body = null;
          }

          // support cache busting like jQuery.ajax({cache:false})
          function modifiedUrl(baseUrl, cached) {

            if (cached === false) {

              if (baseUrl.indexOf('?') == -1) {
                baseUrl += '?';
              } else {
                baseUrl += '&';
              }

              baseUrl += '_=' + new Date().getTime();
            }
            return baseUrl;
          }

          return passthrough(httpMethodName || 'GET', modifiedUrl(url, cached), body, headers, withCredentials || false);
        }

        // export public API
        function oboe(arg1) {

          // We use duck-typing to detect if the parameter given is a stream, with the
          // below list of parameters.
          // Unpipe and unshift would normally be present on a stream but this breaks
          // compatibility with Request streams.
          // See https://github.com/jimhigson/oboe.js/issues/65

          var nodeStreamMethodNames = list('resume', 'pause', 'pipe'),
              isStream = partialComplete(hasAllProperties, nodeStreamMethodNames);

          if (arg1) {
            if (isStream(arg1) || isString(arg1)) {

              //  simple version for GETs. Signature is:
              //    oboe( url )
              //  or, under node:
              //    oboe( readableStream )
              return applyDefaults(wire, arg1 // url
              );
            } else {

              // method signature is:
              //    oboe({method:m, url:u, body:b, headers:{...}})

              return applyDefaults(wire, arg1.url, arg1.method, arg1.body, arg1.headers, arg1.withCredentials, arg1.cached);
            }
          } else {
            // wire up a no-AJAX, no-stream Oboe. Will have to have content 
            // fed in externally and using .emit.
            return wire();
          }
        }

        /* oboe.drop is a special value. If a node callback returns this value the
           parsed node is deleted from the JSON
         */
        oboe.drop = function () {
          return oboe.drop;
        };

        if (typeof define === "function" && define.amd) {
          define("oboe", [], function () {
            return oboe;
          });
        } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
          module.exports = oboe;
        } else {
          window.oboe = oboe;
        }
      })(function () {
        // Access to the window object throws an exception in HTML5 web workers so
        // point it to "self" if it runs in a web worker
        try {
          return window;
        } catch (e) {
          return self;
        }
      }(), Object, Array, Error, JSON);
    }, {}], 25: [function (require, module, exports) {
      exports.endianness = function () {
        return 'LE';
      };

      exports.hostname = function () {
        if (typeof location !== 'undefined') {
          return location.hostname;
        } else return '';
      };

      exports.loadavg = function () {
        return [];
      };

      exports.uptime = function () {
        return 0;
      };

      exports.freemem = function () {
        return Number.MAX_VALUE;
      };

      exports.totalmem = function () {
        return Number.MAX_VALUE;
      };

      exports.cpus = function () {
        return [];
      };

      exports.type = function () {
        return 'Browser';
      };

      exports.release = function () {
        if (typeof navigator !== 'undefined') {
          return navigator.appVersion;
        }
        return '';
      };

      exports.networkInterfaces = exports.getNetworkInterfaces = function () {
        return {};
      };

      exports.arch = function () {
        return 'javascript';
      };

      exports.platform = function () {
        return 'browser';
      };

      exports.tmpdir = exports.tmpDir = function () {
        return '/tmp';
      };

      exports.EOL = '\n';

      exports.homedir = function () {
        return '/';
      };
    }, {}], 26: [function (require, module, exports) {
      (function (process) {
        'use strict';

        if (!process.version || process.version.indexOf('v0.') === 0 || process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
          module.exports = { nextTick: nextTick };
        } else {
          module.exports = process;
        }

        function nextTick(fn, arg1, arg2, arg3) {
          if (typeof fn !== 'function') {
            throw new TypeError('"callback" argument must be a function');
          }
          var len = arguments.length;
          var args, i;
          switch (len) {
            case 0:
            case 1:
              return process.nextTick(fn);
            case 2:
              return process.nextTick(function afterTickOne() {
                fn.call(null, arg1);
              });
            case 3:
              return process.nextTick(function afterTickTwo() {
                fn.call(null, arg1, arg2);
              });
            case 4:
              return process.nextTick(function afterTickThree() {
                fn.call(null, arg1, arg2, arg3);
              });
            default:
              args = new Array(len - 1);
              i = 0;
              while (i < args.length) {
                args[i++] = arguments[i];
              }
              return process.nextTick(function afterTick() {
                fn.apply(null, args);
              });
          }
        }
      }).call(this, require('_process'));
    }, { "_process": 27 }], 27: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {};

      // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

      // v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) {
        return [];
      };

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function () {
        return 0;
      };
    }, {}], 28: [function (require, module, exports) {
      (function (global) {
        /*! https://mths.be/punycode v1.4.1 by @mathias */
        ;(function (root) {

          /** Detect free variables */
          var freeExports = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
          var freeModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) == 'object' && module && !module.nodeType && module;
          var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global;
          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
            root = freeGlobal;
          }

          /**
           * The `punycode` object.
           * @name punycode
           * @type Object
           */
          var punycode,


          /** Highest positive signed 32-bit float value */
          maxInt = 2147483647,
              // aka. 0x7FFFFFFF or 2^31-1

          /** Bootstring parameters */
          base = 36,
              tMin = 1,
              tMax = 26,
              skew = 38,
              damp = 700,
              initialBias = 72,
              initialN = 128,
              // 0x80
          delimiter = '-',
              // '\x2D'

          /** Regular expressions */
          regexPunycode = /^xn--/,
              regexNonASCII = /[^\x20-\x7E]/,
              // unprintable ASCII chars + non-ASCII chars
          regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g,
              // RFC 3490 separators

          /** Error messages */
          errors = {
            'overflow': 'Overflow: input needs wider integers to process',
            'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
            'invalid-input': 'Invalid input'
          },


          /** Convenience shortcuts */
          baseMinusTMin = base - tMin,
              floor = Math.floor,
              stringFromCharCode = String.fromCharCode,


          /** Temporary variable */
          key;

          /*--------------------------------------------------------------------------*/

          /**
           * A generic error utility function.
           * @private
           * @param {String} type The error type.
           * @returns {Error} Throws a `RangeError` with the applicable error message.
           */
          function error(type) {
            throw new RangeError(errors[type]);
          }

          /**
           * A generic `Array#map` utility function.
           * @private
           * @param {Array} array The array to iterate over.
           * @param {Function} callback The function that gets called for every array
           * item.
           * @returns {Array} A new array of values returned by the callback function.
           */
          function map(array, fn) {
            var length = array.length;
            var result = [];
            while (length--) {
              result[length] = fn(array[length]);
            }
            return result;
          }

          /**
           * A simple `Array#map`-like wrapper to work with domain name strings or email
           * addresses.
           * @private
           * @param {String} domain The domain name or email address.
           * @param {Function} callback The function that gets called for every
           * character.
           * @returns {Array} A new string of characters returned by the callback
           * function.
           */
          function mapDomain(string, fn) {
            var parts = string.split('@');
            var result = '';
            if (parts.length > 1) {
              // In email addresses, only the domain name should be punycoded. Leave
              // the local part (i.e. everything up to `@`) intact.
              result = parts[0] + '@';
              string = parts[1];
            }
            // Avoid `split(regex)` for IE8 compatibility. See #17.
            string = string.replace(regexSeparators, '\x2E');
            var labels = string.split('.');
            var encoded = map(labels, fn).join('.');
            return result + encoded;
          }

          /**
           * Creates an array containing the numeric code points of each Unicode
           * character in the string. While JavaScript uses UCS-2 internally,
           * this function will convert a pair of surrogate halves (each of which
           * UCS-2 exposes as separate characters) into a single code point,
           * matching UTF-16.
           * @see `punycode.ucs2.encode`
           * @see <https://mathiasbynens.be/notes/javascript-encoding>
           * @memberOf punycode.ucs2
           * @name decode
           * @param {String} string The Unicode input string (UCS-2).
           * @returns {Array} The new array of code points.
           */
          function ucs2decode(string) {
            var output = [],
                counter = 0,
                length = string.length,
                value,
                extra;
            while (counter < length) {
              value = string.charCodeAt(counter++);
              if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                  // low surrogate
                  output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                  // unmatched surrogate; only append this code unit, in case the next
                  // code unit is the high surrogate of a surrogate pair
                  output.push(value);
                  counter--;
                }
              } else {
                output.push(value);
              }
            }
            return output;
          }

          /**
           * Creates a string based on an array of numeric code points.
           * @see `punycode.ucs2.decode`
           * @memberOf punycode.ucs2
           * @name encode
           * @param {Array} codePoints The array of numeric code points.
           * @returns {String} The new Unicode string (UCS-2).
           */
          function ucs2encode(array) {
            return map(array, function (value) {
              var output = '';
              if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
              }
              output += stringFromCharCode(value);
              return output;
            }).join('');
          }

          /**
           * Converts a basic code point into a digit/integer.
           * @see `digitToBasic()`
           * @private
           * @param {Number} codePoint The basic numeric code point value.
           * @returns {Number} The numeric value of a basic code point (for use in
           * representing integers) in the range `0` to `base - 1`, or `base` if
           * the code point does not represent a value.
           */
          function basicToDigit(codePoint) {
            if (codePoint - 48 < 10) {
              return codePoint - 22;
            }
            if (codePoint - 65 < 26) {
              return codePoint - 65;
            }
            if (codePoint - 97 < 26) {
              return codePoint - 97;
            }
            return base;
          }

          /**
           * Converts a digit/integer into a basic code point.
           * @see `basicToDigit()`
           * @private
           * @param {Number} digit The numeric value of a basic code point.
           * @returns {Number} The basic code point whose value (when used for
           * representing integers) is `digit`, which needs to be in the range
           * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
           * used; else, the lowercase form is used. The behavior is undefined
           * if `flag` is non-zero and `digit` has no uppercase form.
           */
          function digitToBasic(digit, flag) {
            //  0..25 map to ASCII a..z or A..Z
            // 26..35 map to ASCII 0..9
            return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
          }

          /**
           * Bias adaptation function as per section 3.4 of RFC 3492.
           * https://tools.ietf.org/html/rfc3492#section-3.4
           * @private
           */
          function adapt(delta, numPoints, firstTime) {
            var k = 0;
            delta = firstTime ? floor(delta / damp) : delta >> 1;
            delta += floor(delta / numPoints);
            for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
              delta = floor(delta / baseMinusTMin);
            }
            return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
          }

          /**
           * Converts a Punycode string of ASCII-only symbols to a string of Unicode
           * symbols.
           * @memberOf punycode
           * @param {String} input The Punycode string of ASCII-only symbols.
           * @returns {String} The resulting string of Unicode symbols.
           */
          function decode(input) {
            // Don't use UCS-2
            var output = [],
                inputLength = input.length,
                out,
                i = 0,
                n = initialN,
                bias = initialBias,
                basic,
                j,
                index,
                oldi,
                w,
                k,
                digit,
                t,

            /** Cached calculation results */
            baseMinusT;

            // Handle the basic code points: let `basic` be the number of input code
            // points before the last delimiter, or `0` if there is none, then copy
            // the first basic code points to the output.

            basic = input.lastIndexOf(delimiter);
            if (basic < 0) {
              basic = 0;
            }

            for (j = 0; j < basic; ++j) {
              // if it's not a basic code point
              if (input.charCodeAt(j) >= 0x80) {
                error('not-basic');
              }
              output.push(input.charCodeAt(j));
            }

            // Main decoding loop: start just after the last delimiter if any basic code
            // points were copied; start at the beginning otherwise.

            for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

              // `index` is the index of the next character to be consumed.
              // Decode a generalized variable-length integer into `delta`,
              // which gets added to `i`. The overflow checking is easier
              // if we increase `i` as we go, then subtract off its starting
              // value at the end to obtain `delta`.
              for (oldi = i, w = 1, k = base;; /* no condition */k += base) {

                if (index >= inputLength) {
                  error('invalid-input');
                }

                digit = basicToDigit(input.charCodeAt(index++));

                if (digit >= base || digit > floor((maxInt - i) / w)) {
                  error('overflow');
                }

                i += digit * w;
                t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

                if (digit < t) {
                  break;
                }

                baseMinusT = base - t;
                if (w > floor(maxInt / baseMinusT)) {
                  error('overflow');
                }

                w *= baseMinusT;
              }

              out = output.length + 1;
              bias = adapt(i - oldi, out, oldi == 0);

              // `i` was supposed to wrap around from `out` to `0`,
              // incrementing `n` each time, so we'll fix that now:
              if (floor(i / out) > maxInt - n) {
                error('overflow');
              }

              n += floor(i / out);
              i %= out;

              // Insert `n` at position `i` of the output
              output.splice(i++, 0, n);
            }

            return ucs2encode(output);
          }

          /**
           * Converts a string of Unicode symbols (e.g. a domain name label) to a
           * Punycode string of ASCII-only symbols.
           * @memberOf punycode
           * @param {String} input The string of Unicode symbols.
           * @returns {String} The resulting Punycode string of ASCII-only symbols.
           */
          function encode(input) {
            var n,
                delta,
                handledCPCount,
                basicLength,
                bias,
                j,
                m,
                q,
                k,
                t,
                currentValue,
                output = [],

            /** `inputLength` will hold the number of code points in `input`. */
            inputLength,

            /** Cached calculation results */
            handledCPCountPlusOne,
                baseMinusT,
                qMinusT;

            // Convert the input in UCS-2 to Unicode
            input = ucs2decode(input);

            // Cache the length
            inputLength = input.length;

            // Initialize the state
            n = initialN;
            delta = 0;
            bias = initialBias;

            // Handle the basic code points
            for (j = 0; j < inputLength; ++j) {
              currentValue = input[j];
              if (currentValue < 0x80) {
                output.push(stringFromCharCode(currentValue));
              }
            }

            handledCPCount = basicLength = output.length;

            // `handledCPCount` is the number of code points that have been handled;
            // `basicLength` is the number of basic code points.

            // Finish the basic string - if it is not empty - with a delimiter
            if (basicLength) {
              output.push(delimiter);
            }

            // Main encoding loop:
            while (handledCPCount < inputLength) {

              // All non-basic code points < n have been handled already. Find the next
              // larger one:
              for (m = maxInt, j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue >= n && currentValue < m) {
                  m = currentValue;
                }
              }

              // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
              // but guard against overflow
              handledCPCountPlusOne = handledCPCount + 1;
              if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                error('overflow');
              }

              delta += (m - n) * handledCPCountPlusOne;
              n = m;

              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];

                if (currentValue < n && ++delta > maxInt) {
                  error('overflow');
                }

                if (currentValue == n) {
                  // Represent delta as a generalized variable-length integer
                  for (q = delta, k = base;; /* no condition */k += base) {
                    t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                    if (q < t) {
                      break;
                    }
                    qMinusT = q - t;
                    baseMinusT = base - t;
                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                    q = floor(qMinusT / baseMinusT);
                  }

                  output.push(stringFromCharCode(digitToBasic(q, 0)));
                  bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                  delta = 0;
                  ++handledCPCount;
                }
              }

              ++delta;
              ++n;
            }
            return output.join('');
          }

          /**
           * Converts a Punycode string representing a domain name or an email address
           * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
           * it doesn't matter if you call it on a string that has already been
           * converted to Unicode.
           * @memberOf punycode
           * @param {String} input The Punycoded domain name or email address to
           * convert to Unicode.
           * @returns {String} The Unicode representation of the given Punycode
           * string.
           */
          function toUnicode(input) {
            return mapDomain(input, function (string) {
              return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
            });
          }

          /**
           * Converts a Unicode string representing a domain name or an email address to
           * Punycode. Only the non-ASCII parts of the domain name will be converted,
           * i.e. it doesn't matter if you call it with a domain that's already in
           * ASCII.
           * @memberOf punycode
           * @param {String} input The domain name or email address to convert, as a
           * Unicode string.
           * @returns {String} The Punycode representation of the given domain name or
           * email address.
           */
          function toASCII(input) {
            return mapDomain(input, function (string) {
              return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
            });
          }

          /*--------------------------------------------------------------------------*/

          /** Define the public API */
          punycode = {
            /**
             * A string representing the current Punycode.js version number.
             * @memberOf punycode
             * @type String
             */
            'version': '1.4.1',
            /**
             * An object of methods to convert from JavaScript's internal character
             * representation (UCS-2) to Unicode code points, and back.
             * @see <https://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode
             * @type Object
             */
            'ucs2': {
              'decode': ucs2decode,
              'encode': ucs2encode
            },
            'decode': decode,
            'encode': encode,
            'toASCII': toASCII,
            'toUnicode': toUnicode
          };

          /** Expose `punycode` */
          // Some AMD build optimizers, like r.js, check for specific condition patterns
          // like the following:
          if (typeof define == 'function' && _typeof(define.amd) == 'object' && define.amd) {
            define('punycode', function () {
              return punycode;
            });
          } else if (freeExports && freeModule) {
            if (module.exports == freeExports) {
              // in Node.js, io.js, or RingoJS v0.8.0+
              freeModule.exports = punycode;
            } else {
              // in Narwhal or RingoJS v0.7.0-
              for (key in punycode) {
                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
              }
            }
          } else {
            // in Rhino or a web browser
            root.punycode = punycode;
          }
        })(this);
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 29: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      'use strict';

      // If obj.hasOwnProperty has been overridden, then calling
      // obj.hasOwnProperty(prop) will break.
      // See: https://github.com/joyent/node/issues/1707

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }

      module.exports = function (qs, sep, eq, options) {
        sep = sep || '&';
        eq = eq || '=';
        var obj = {};

        if (typeof qs !== 'string' || qs.length === 0) {
          return obj;
        }

        var regexp = /\+/g;
        qs = qs.split(sep);

        var maxKeys = 1000;
        if (options && typeof options.maxKeys === 'number') {
          maxKeys = options.maxKeys;
        }

        var len = qs.length;
        // maxKeys <= 0 means that we should not limit keys count
        if (maxKeys > 0 && len > maxKeys) {
          len = maxKeys;
        }

        for (var i = 0; i < len; ++i) {
          var x = qs[i].replace(regexp, '%20'),
              idx = x.indexOf(eq),
              kstr,
              vstr,
              k,
              v;

          if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
          } else {
            kstr = x;
            vstr = '';
          }

          k = decodeURIComponent(kstr);
          v = decodeURIComponent(vstr);

          if (!hasOwnProperty(obj, k)) {
            obj[k] = v;
          } else if (isArray(obj[k])) {
            obj[k].push(v);
          } else {
            obj[k] = [obj[k], v];
          }
        }

        return obj;
      };

      var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
    }, {}], 30: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      'use strict';

      var stringifyPrimitive = function stringifyPrimitive(v) {
        switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
          case 'string':
            return v;

          case 'boolean':
            return v ? 'true' : 'false';

          case 'number':
            return isFinite(v) ? v : '';

          default:
            return '';
        }
      };

      module.exports = function (obj, sep, eq, name) {
        sep = sep || '&';
        eq = eq || '=';
        if (obj === null) {
          obj = undefined;
        }

        if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === 'object') {
          return map(objectKeys(obj), function (k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
            if (isArray(obj[k])) {
              return map(obj[k], function (v) {
                return ks + encodeURIComponent(stringifyPrimitive(v));
              }).join(sep);
            } else {
              return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
          }).join(sep);
        }

        if (!name) return '';
        return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
      };

      var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };

      function map(xs, f) {
        if (xs.map) return xs.map(f);
        var res = [];
        for (var i = 0; i < xs.length; i++) {
          res.push(f(xs[i], i));
        }
        return res;
      }

      var objectKeys = Object.keys || function (obj) {
        var res = [];
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
        }
        return res;
      };
    }, {}], 31: [function (require, module, exports) {
      'use strict';

      exports.decode = exports.parse = require('./decode');
      exports.encode = exports.stringify = require('./encode');
    }, { "./decode": 29, "./encode": 30 }], 32: [function (require, module, exports) {
      module.exports = window.crypto;
    }, {}], 33: [function (require, module, exports) {
      module.exports = require('crypto');
    }, { "crypto": 32 }], 34: [function (require, module, exports) {
      var randomHex = function randomHex(size, callback) {
        var crypto = require('./crypto.js');
        var isCallback = typeof callback === 'function';

        if (size > 65536) {
          if (isCallback) {
            callback(new Error('Requested too many random bytes.'));
          } else {
            throw new Error('Requested too many random bytes.');
          }
        };

        // is node
        if (typeof crypto !== 'undefined' && crypto.randomBytes) {

          if (isCallback) {
            crypto.randomBytes(size, function (err, result) {
              if (!err) {
                callback(null, '0x' + result.toString('hex'));
              } else {
                callback(error);
              }
            });
          } else {
            return '0x' + crypto.randomBytes(size).toString('hex');
          }

          // is browser
        } else {
          var cryptoLib;

          if (typeof crypto !== 'undefined') {
            cryptoLib = crypto;
          } else if (typeof msCrypto !== 'undefined') {
            cryptoLib = msCrypto;
          }

          if (cryptoLib && cryptoLib.getRandomValues) {
            var randomBytes = cryptoLib.getRandomValues(new Uint8Array(size));
            var returnValue = '0x' + Array.from(randomBytes).map(function (arr) {
              return arr.toString(16);
            }).join('');

            if (isCallback) {
              callback(null, returnValue);
            } else {
              return returnValue;
            }

            // not crypto object
          } else {
            var error = new Error('No "crypto" object available. This Browser doesn\'t support generating secure random bytes.');

            if (isCallback) {
              callback(error);
            } else {
              throw error;
            }
          }
        }
      };

      module.exports = randomHex;
    }, { "./crypto.js": 33 }], 35: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      // a duplex stream is just a stream that is both readable and writable.
      // Since JS doesn't have multiple prototypal inheritance, this class
      // prototypally inherits from Readable, and then parasitically from
      // Writable.

      'use strict';

      /*<replacement>*/

      var pna = require('process-nextick-args');
      /*</replacement>*/

      /*<replacement>*/
      var objectKeys = Object.keys || function (obj) {
        var keys = [];
        for (var key in obj) {
          keys.push(key);
        }return keys;
      };
      /*</replacement>*/

      module.exports = Duplex;

      /*<replacement>*/
      var util = require('core-util-is');
      util.inherits = require('inherits');
      /*</replacement>*/

      var Readable = require('./_stream_readable');
      var Writable = require('./_stream_writable');

      util.inherits(Duplex, Readable);

      {
        // avoid scope creep, the keys array can then be collected
        var keys = objectKeys(Writable.prototype);
        for (var v = 0; v < keys.length; v++) {
          var method = keys[v];
          if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
        }
      }

      function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);

        Readable.call(this, options);
        Writable.call(this, options);

        if (options && options.readable === false) this.readable = false;

        if (options && options.writable === false) this.writable = false;

        this.allowHalfOpen = true;
        if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

        this.once('end', onend);
      }

      Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.highWaterMark;
        }
      });

      // the no-half-open enforcer
      function onend() {
        // if we allow half-open state, or if the writable side ended,
        // then we're ok.
        if (this.allowHalfOpen || this._writableState.ended) return;

        // no more data can be written.
        // But allow more writes to happen in this tick.
        pna.nextTick(onEndNT, this);
      }

      function onEndNT(self) {
        self.end();
      }

      Object.defineProperty(Duplex.prototype, 'destroyed', {
        get: function get() {
          if (this._readableState === undefined || this._writableState === undefined) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set: function set(value) {
          // we ignore the value if the stream
          // has not been initialized yet
          if (this._readableState === undefined || this._writableState === undefined) {
            return;
          }

          // backward compatibility, the user is explicitly
          // managing destroyed
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      });

      Duplex.prototype._destroy = function (err, cb) {
        this.push(null);
        this.end();

        pna.nextTick(cb, err);
      };
    }, { "./_stream_readable": 37, "./_stream_writable": 39, "core-util-is": 9, "inherits": 18, "process-nextick-args": 26 }], 36: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      // a passthrough stream.
      // basically just the most minimal sort of Transform stream.
      // Every written chunk gets output as-is.

      'use strict';

      module.exports = PassThrough;

      var Transform = require('./_stream_transform');

      /*<replacement>*/
      var util = require('core-util-is');
      util.inherits = require('inherits');
      /*</replacement>*/

      util.inherits(PassThrough, Transform);

      function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);

        Transform.call(this, options);
      }

      PassThrough.prototype._transform = function (chunk, encoding, cb) {
        cb(null, chunk);
      };
    }, { "./_stream_transform": 38, "core-util-is": 9, "inherits": 18 }], 37: [function (require, module, exports) {
      (function (process, global) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        'use strict';

        /*<replacement>*/

        var pna = require('process-nextick-args');
        /*</replacement>*/

        module.exports = Readable;

        /*<replacement>*/
        var isArray = require('isarray');
        /*</replacement>*/

        /*<replacement>*/
        var Duplex;
        /*</replacement>*/

        Readable.ReadableState = ReadableState;

        /*<replacement>*/
        var EE = require('events').EventEmitter;

        var EElistenerCount = function EElistenerCount(emitter, type) {
          return emitter.listeners(type).length;
        };
        /*</replacement>*/

        /*<replacement>*/
        var Stream = require('./internal/streams/stream');
        /*</replacement>*/

        /*<replacement>*/

        var Buffer = require('safe-buffer').Buffer;
        var OurUint8Array = global.Uint8Array || function () {};
        function _uint8ArrayToBuffer(chunk) {
          return Buffer.from(chunk);
        }
        function _isUint8Array(obj) {
          return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
        }

        /*</replacement>*/

        /*<replacement>*/
        var util = require('core-util-is');
        util.inherits = require('inherits');
        /*</replacement>*/

        /*<replacement>*/
        var debugUtil = require('util');
        var debug = void 0;
        if (debugUtil && debugUtil.debuglog) {
          debug = debugUtil.debuglog('stream');
        } else {
          debug = function debug() {};
        }
        /*</replacement>*/

        var BufferList = require('./internal/streams/BufferList');
        var destroyImpl = require('./internal/streams/destroy');
        var StringDecoder;

        util.inherits(Readable, Stream);

        var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

        function prependListener(emitter, event, fn) {
          // Sadly this is not cacheable as some libraries bundle their own
          // event emitter implementation with them.
          if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

          // This is a hack to make sure that our error handler is attached before any
          // userland ones.  NEVER DO THIS. This is here only because this code needs
          // to continue to work with older versions of Node.js that do not include
          // the prependListener() method. The goal is to eventually remove this hack.
          if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
        }

        function ReadableState(options, stream) {
          Duplex = Duplex || require('./_stream_duplex');

          options = options || {};

          // Duplex streams are both readable and writable, but share
          // the same options object.
          // However, some cases require setting options to different
          // values for the readable and the writable sides of the duplex stream.
          // These options can be provided separately as readableXXX and writableXXX.
          var isDuplex = stream instanceof Duplex;

          // object stream flag. Used to make read(n) ignore n and to
          // make all the buffer merging and length checks go away
          this.objectMode = !!options.objectMode;

          if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

          // the point at which it stops calling _read() to fill the buffer
          // Note: 0 is a valid value, means "don't call _read preemptively ever"
          var hwm = options.highWaterMark;
          var readableHwm = options.readableHighWaterMark;
          var defaultHwm = this.objectMode ? 16 : 16 * 1024;

          if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

          // cast to ints.
          this.highWaterMark = Math.floor(this.highWaterMark);

          // A linked list is used to store data chunks instead of an array because the
          // linked list can remove elements from the beginning faster than
          // array.shift()
          this.buffer = new BufferList();
          this.length = 0;
          this.pipes = null;
          this.pipesCount = 0;
          this.flowing = null;
          this.ended = false;
          this.endEmitted = false;
          this.reading = false;

          // a flag to be able to tell if the event 'readable'/'data' is emitted
          // immediately, or on a later tick.  We set this to true at first, because
          // any actions that shouldn't happen until "later" should generally also
          // not happen before the first read call.
          this.sync = true;

          // whenever we return null, then we set a flag to say
          // that we're awaiting a 'readable' event emission.
          this.needReadable = false;
          this.emittedReadable = false;
          this.readableListening = false;
          this.resumeScheduled = false;

          // has it been destroyed
          this.destroyed = false;

          // Crypto is kind of old and crusty.  Historically, its default string
          // encoding is 'binary' so we have to make this configurable.
          // Everything else in the universe uses 'utf8', though.
          this.defaultEncoding = options.defaultEncoding || 'utf8';

          // the number of writers that are awaiting a drain event in .pipe()s
          this.awaitDrain = 0;

          // if true, a maybeReadMore has been scheduled
          this.readingMore = false;

          this.decoder = null;
          this.encoding = null;
          if (options.encoding) {
            if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
            this.decoder = new StringDecoder(options.encoding);
            this.encoding = options.encoding;
          }
        }

        function Readable(options) {
          Duplex = Duplex || require('./_stream_duplex');

          if (!(this instanceof Readable)) return new Readable(options);

          this._readableState = new ReadableState(options, this);

          // legacy
          this.readable = true;

          if (options) {
            if (typeof options.read === 'function') this._read = options.read;

            if (typeof options.destroy === 'function') this._destroy = options.destroy;
          }

          Stream.call(this);
        }

        Object.defineProperty(Readable.prototype, 'destroyed', {
          get: function get() {
            if (this._readableState === undefined) {
              return false;
            }
            return this._readableState.destroyed;
          },
          set: function set(value) {
            // we ignore the value if the stream
            // has not been initialized yet
            if (!this._readableState) {
              return;
            }

            // backward compatibility, the user is explicitly
            // managing destroyed
            this._readableState.destroyed = value;
          }
        });

        Readable.prototype.destroy = destroyImpl.destroy;
        Readable.prototype._undestroy = destroyImpl.undestroy;
        Readable.prototype._destroy = function (err, cb) {
          this.push(null);
          cb(err);
        };

        // Manually shove something into the read() buffer.
        // This returns true if the highWaterMark has not been hit yet,
        // similar to how Writable.write() returns true if you should
        // write() some more.
        Readable.prototype.push = function (chunk, encoding) {
          var state = this._readableState;
          var skipChunkCheck;

          if (!state.objectMode) {
            if (typeof chunk === 'string') {
              encoding = encoding || state.defaultEncoding;
              if (encoding !== state.encoding) {
                chunk = Buffer.from(chunk, encoding);
                encoding = '';
              }
              skipChunkCheck = true;
            }
          } else {
            skipChunkCheck = true;
          }

          return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
        };

        // Unshift should *always* be something directly out of read()
        Readable.prototype.unshift = function (chunk) {
          return readableAddChunk(this, chunk, null, true, false);
        };

        function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
          var state = stream._readableState;
          if (chunk === null) {
            state.reading = false;
            onEofChunk(stream, state);
          } else {
            var er;
            if (!skipChunkCheck) er = chunkInvalid(state, chunk);
            if (er) {
              stream.emit('error', er);
            } else if (state.objectMode || chunk && chunk.length > 0) {
              if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
                chunk = _uint8ArrayToBuffer(chunk);
              }

              if (addToFront) {
                if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
              } else if (state.ended) {
                stream.emit('error', new Error('stream.push() after EOF'));
              } else {
                state.reading = false;
                if (state.decoder && !encoding) {
                  chunk = state.decoder.write(chunk);
                  if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
                } else {
                  addChunk(stream, state, chunk, false);
                }
              }
            } else if (!addToFront) {
              state.reading = false;
            }
          }

          return needMoreData(state);
        }

        function addChunk(stream, state, chunk, addToFront) {
          if (state.flowing && state.length === 0 && !state.sync) {
            stream.emit('data', chunk);
            stream.read(0);
          } else {
            // update the buffer info.
            state.length += state.objectMode ? 1 : chunk.length;
            if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

            if (state.needReadable) emitReadable(stream);
          }
          maybeReadMore(stream, state);
        }

        function chunkInvalid(state, chunk) {
          var er;
          if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
            er = new TypeError('Invalid non-string/buffer chunk');
          }
          return er;
        }

        // if it's past the high water mark, we can push in some more.
        // Also, if we have no data yet, we can stand some
        // more bytes.  This is to work around cases where hwm=0,
        // such as the repl.  Also, if the push() triggered a
        // readable event, and the user called read(largeNumber) such that
        // needReadable was set, then we ought to push more, so that another
        // 'readable' event will be triggered.
        function needMoreData(state) {
          return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
        }

        Readable.prototype.isPaused = function () {
          return this._readableState.flowing === false;
        };

        // backwards compatibility.
        Readable.prototype.setEncoding = function (enc) {
          if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
          this._readableState.decoder = new StringDecoder(enc);
          this._readableState.encoding = enc;
          return this;
        };

        // Don't raise the hwm > 8MB
        var MAX_HWM = 0x800000;
        function computeNewHighWaterMark(n) {
          if (n >= MAX_HWM) {
            n = MAX_HWM;
          } else {
            // Get the next highest power of 2 to prevent increasing hwm excessively in
            // tiny amounts
            n--;
            n |= n >>> 1;
            n |= n >>> 2;
            n |= n >>> 4;
            n |= n >>> 8;
            n |= n >>> 16;
            n++;
          }
          return n;
        }

        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function howMuchToRead(n, state) {
          if (n <= 0 || state.length === 0 && state.ended) return 0;
          if (state.objectMode) return 1;
          if (n !== n) {
            // Only flow one buffer at a time
            if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
          }
          // If we're asking for more than the current hwm, then raise the hwm.
          if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
          if (n <= state.length) return n;
          // Don't have enough
          if (!state.ended) {
            state.needReadable = true;
            return 0;
          }
          return state.length;
        }

        // you can override either this method, or the async _read(n) below.
        Readable.prototype.read = function (n) {
          debug('read', n);
          n = parseInt(n, 10);
          var state = this._readableState;
          var nOrig = n;

          if (n !== 0) state.emittedReadable = false;

          // if we're doing read(0) to trigger a readable event, but we
          // already have a bunch of data in the buffer, then just trigger
          // the 'readable' event and move on.
          if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
            debug('read: emitReadable', state.length, state.ended);
            if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
            return null;
          }

          n = howMuchToRead(n, state);

          // if we've ended, and we're now clear, then finish it up.
          if (n === 0 && state.ended) {
            if (state.length === 0) endReadable(this);
            return null;
          }

          // All the actual chunk generation logic needs to be
          // *below* the call to _read.  The reason is that in certain
          // synthetic stream cases, such as passthrough streams, _read
          // may be a completely synchronous operation which may change
          // the state of the read buffer, providing enough data when
          // before there was *not* enough.
          //
          // So, the steps are:
          // 1. Figure out what the state of things will be after we do
          // a read from the buffer.
          //
          // 2. If that resulting state will trigger a _read, then call _read.
          // Note that this may be asynchronous, or synchronous.  Yes, it is
          // deeply ugly to write APIs this way, but that still doesn't mean
          // that the Readable class should behave improperly, as streams are
          // designed to be sync/async agnostic.
          // Take note if the _read call is sync or async (ie, if the read call
          // has returned yet), so that we know whether or not it's safe to emit
          // 'readable' etc.
          //
          // 3. Actually pull the requested chunks out of the buffer and return.

          // if we need a readable event, then we need to do some reading.
          var doRead = state.needReadable;
          debug('need readable', doRead);

          // if we currently have less than the highWaterMark, then also read some
          if (state.length === 0 || state.length - n < state.highWaterMark) {
            doRead = true;
            debug('length less than watermark', doRead);
          }

          // however, if we've ended, then there's no point, and if we're already
          // reading, then it's unnecessary.
          if (state.ended || state.reading) {
            doRead = false;
            debug('reading or ended', doRead);
          } else if (doRead) {
            debug('do read');
            state.reading = true;
            state.sync = true;
            // if the length is currently zero, then we *need* a readable event.
            if (state.length === 0) state.needReadable = true;
            // call internal read method
            this._read(state.highWaterMark);
            state.sync = false;
            // If _read pushed data synchronously, then `reading` will be false,
            // and we need to re-evaluate how much data we can return to the user.
            if (!state.reading) n = howMuchToRead(nOrig, state);
          }

          var ret;
          if (n > 0) ret = fromList(n, state);else ret = null;

          if (ret === null) {
            state.needReadable = true;
            n = 0;
          } else {
            state.length -= n;
          }

          if (state.length === 0) {
            // If we have nothing in the buffer, then we want to know
            // as soon as we *do* get something into the buffer.
            if (!state.ended) state.needReadable = true;

            // If we tried to read() past the EOF, then emit end on the next tick.
            if (nOrig !== n && state.ended) endReadable(this);
          }

          if (ret !== null) this.emit('data', ret);

          return ret;
        };

        function onEofChunk(stream, state) {
          if (state.ended) return;
          if (state.decoder) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length) {
              state.buffer.push(chunk);
              state.length += state.objectMode ? 1 : chunk.length;
            }
          }
          state.ended = true;

          // emit 'readable' now to make sure it gets picked up.
          emitReadable(stream);
        }

        // Don't emit readable right away in sync mode, because this can trigger
        // another read() call => stack overflow.  This way, it might trigger
        // a nextTick recursion warning, but that's not so bad.
        function emitReadable(stream) {
          var state = stream._readableState;
          state.needReadable = false;
          if (!state.emittedReadable) {
            debug('emitReadable', state.flowing);
            state.emittedReadable = true;
            if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
          }
        }

        function emitReadable_(stream) {
          debug('emit readable');
          stream.emit('readable');
          flow(stream);
        }

        // at this point, the user has presumably seen the 'readable' event,
        // and called read() to consume some data.  that may have triggered
        // in turn another _read(n) call, in which case reading = true if
        // it's in progress.
        // However, if we're not ended, or reading, and the length < hwm,
        // then go ahead and try to read some more preemptively.
        function maybeReadMore(stream, state) {
          if (!state.readingMore) {
            state.readingMore = true;
            pna.nextTick(maybeReadMore_, stream, state);
          }
        }

        function maybeReadMore_(stream, state) {
          var len = state.length;
          while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
            debug('maybeReadMore read 0');
            stream.read(0);
            if (len === state.length)
              // didn't get any data, stop spinning.
              break;else len = state.length;
          }
          state.readingMore = false;
        }

        // abstract method.  to be overridden in specific implementation classes.
        // call cb(er, data) where data is <= n in length.
        // for virtual (non-string, non-buffer) streams, "length" is somewhat
        // arbitrary, and perhaps not very meaningful.
        Readable.prototype._read = function (n) {
          this.emit('error', new Error('_read() is not implemented'));
        };

        Readable.prototype.pipe = function (dest, pipeOpts) {
          var src = this;
          var state = this._readableState;

          switch (state.pipesCount) {
            case 0:
              state.pipes = dest;
              break;
            case 1:
              state.pipes = [state.pipes, dest];
              break;
            default:
              state.pipes.push(dest);
              break;
          }
          state.pipesCount += 1;
          debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

          var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

          var endFn = doEnd ? onend : unpipe;
          if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

          dest.on('unpipe', onunpipe);
          function onunpipe(readable, unpipeInfo) {
            debug('onunpipe');
            if (readable === src) {
              if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                unpipeInfo.hasUnpiped = true;
                cleanup();
              }
            }
          }

          function onend() {
            debug('onend');
            dest.end();
          }

          // when the dest drains, it reduces the awaitDrain counter
          // on the source.  This would be more elegant with a .once()
          // handler in flow(), but adding and removing repeatedly is
          // too slow.
          var ondrain = pipeOnDrain(src);
          dest.on('drain', ondrain);

          var cleanedUp = false;
          function cleanup() {
            debug('cleanup');
            // cleanup event handlers once the pipe is broken
            dest.removeListener('close', onclose);
            dest.removeListener('finish', onfinish);
            dest.removeListener('drain', ondrain);
            dest.removeListener('error', onerror);
            dest.removeListener('unpipe', onunpipe);
            src.removeListener('end', onend);
            src.removeListener('end', unpipe);
            src.removeListener('data', ondata);

            cleanedUp = true;

            // if the reader is waiting for a drain event from this
            // specific writer, then it would cause it to never start
            // flowing again.
            // So, if this is awaiting a drain, then we just call it now.
            // If we don't know, then assume that we are waiting for one.
            if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
          }

          // If the user pushes more data while we're writing to dest then we'll end up
          // in ondata again. However, we only want to increase awaitDrain once because
          // dest will only emit one 'drain' event for the multiple writes.
          // => Introduce a guard on increasing awaitDrain.
          var increasedAwaitDrain = false;
          src.on('data', ondata);
          function ondata(chunk) {
            debug('ondata');
            increasedAwaitDrain = false;
            var ret = dest.write(chunk);
            if (false === ret && !increasedAwaitDrain) {
              // If the user unpiped during `dest.write()`, it is possible
              // to get stuck in a permanently paused state if that write
              // also returned false.
              // => Check whether `dest` is still a piping destination.
              if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                debug('false write response, pause', src._readableState.awaitDrain);
                src._readableState.awaitDrain++;
                increasedAwaitDrain = true;
              }
              src.pause();
            }
          }

          // if the dest has an error, then stop piping into it.
          // however, don't suppress the throwing behavior for this.
          function onerror(er) {
            debug('onerror', er);
            unpipe();
            dest.removeListener('error', onerror);
            if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
          }

          // Make sure our error handler is attached before userland ones.
          prependListener(dest, 'error', onerror);

          // Both close and finish should trigger unpipe, but only once.
          function onclose() {
            dest.removeListener('finish', onfinish);
            unpipe();
          }
          dest.once('close', onclose);
          function onfinish() {
            debug('onfinish');
            dest.removeListener('close', onclose);
            unpipe();
          }
          dest.once('finish', onfinish);

          function unpipe() {
            debug('unpipe');
            src.unpipe(dest);
          }

          // tell the dest that it's being piped to
          dest.emit('pipe', src);

          // start the flow if it hasn't been started already.
          if (!state.flowing) {
            debug('pipe resume');
            src.resume();
          }

          return dest;
        };

        function pipeOnDrain(src) {
          return function () {
            var state = src._readableState;
            debug('pipeOnDrain', state.awaitDrain);
            if (state.awaitDrain) state.awaitDrain--;
            if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
              state.flowing = true;
              flow(src);
            }
          };
        }

        Readable.prototype.unpipe = function (dest) {
          var state = this._readableState;
          var unpipeInfo = { hasUnpiped: false };

          // if we're not piping anywhere, then do nothing.
          if (state.pipesCount === 0) return this;

          // just one destination.  most common case.
          if (state.pipesCount === 1) {
            // passed in one, but it's not the right one.
            if (dest && dest !== state.pipes) return this;

            if (!dest) dest = state.pipes;

            // got a match.
            state.pipes = null;
            state.pipesCount = 0;
            state.flowing = false;
            if (dest) dest.emit('unpipe', this, unpipeInfo);
            return this;
          }

          // slow case. multiple pipe destinations.

          if (!dest) {
            // remove all.
            var dests = state.pipes;
            var len = state.pipesCount;
            state.pipes = null;
            state.pipesCount = 0;
            state.flowing = false;

            for (var i = 0; i < len; i++) {
              dests[i].emit('unpipe', this, unpipeInfo);
            }return this;
          }

          // try to find the right one.
          var index = indexOf(state.pipes, dest);
          if (index === -1) return this;

          state.pipes.splice(index, 1);
          state.pipesCount -= 1;
          if (state.pipesCount === 1) state.pipes = state.pipes[0];

          dest.emit('unpipe', this, unpipeInfo);

          return this;
        };

        // set up data events if they are asked for
        // Ensure readable listeners eventually get something
        Readable.prototype.on = function (ev, fn) {
          var res = Stream.prototype.on.call(this, ev, fn);

          if (ev === 'data') {
            // Start flowing on next tick if stream isn't explicitly paused
            if (this._readableState.flowing !== false) this.resume();
          } else if (ev === 'readable') {
            var state = this._readableState;
            if (!state.endEmitted && !state.readableListening) {
              state.readableListening = state.needReadable = true;
              state.emittedReadable = false;
              if (!state.reading) {
                pna.nextTick(nReadingNextTick, this);
              } else if (state.length) {
                emitReadable(this);
              }
            }
          }

          return res;
        };
        Readable.prototype.addListener = Readable.prototype.on;

        function nReadingNextTick(self) {
          debug('readable nexttick read 0');
          self.read(0);
        }

        // pause() and resume() are remnants of the legacy readable stream API
        // If the user uses them, then switch into old mode.
        Readable.prototype.resume = function () {
          var state = this._readableState;
          if (!state.flowing) {
            debug('resume');
            state.flowing = true;
            resume(this, state);
          }
          return this;
        };

        function resume(stream, state) {
          if (!state.resumeScheduled) {
            state.resumeScheduled = true;
            pna.nextTick(resume_, stream, state);
          }
        }

        function resume_(stream, state) {
          if (!state.reading) {
            debug('resume read 0');
            stream.read(0);
          }

          state.resumeScheduled = false;
          state.awaitDrain = 0;
          stream.emit('resume');
          flow(stream);
          if (state.flowing && !state.reading) stream.read(0);
        }

        Readable.prototype.pause = function () {
          debug('call pause flowing=%j', this._readableState.flowing);
          if (false !== this._readableState.flowing) {
            debug('pause');
            this._readableState.flowing = false;
            this.emit('pause');
          }
          return this;
        };

        function flow(stream) {
          var state = stream._readableState;
          debug('flow', state.flowing);
          while (state.flowing && stream.read() !== null) {}
        }

        // wrap an old-style stream as the async data source.
        // This is *not* part of the readable stream interface.
        // It is an ugly unfortunate mess of history.
        Readable.prototype.wrap = function (stream) {
          var _this = this;

          var state = this._readableState;
          var paused = false;

          stream.on('end', function () {
            debug('wrapped end');
            if (state.decoder && !state.ended) {
              var chunk = state.decoder.end();
              if (chunk && chunk.length) _this.push(chunk);
            }

            _this.push(null);
          });

          stream.on('data', function (chunk) {
            debug('wrapped data');
            if (state.decoder) chunk = state.decoder.write(chunk);

            // don't skip over falsy values in objectMode
            if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

            var ret = _this.push(chunk);
            if (!ret) {
              paused = true;
              stream.pause();
            }
          });

          // proxy all the other methods.
          // important when wrapping filters and duplexes.
          for (var i in stream) {
            if (this[i] === undefined && typeof stream[i] === 'function') {
              this[i] = function (method) {
                return function () {
                  return stream[method].apply(stream, arguments);
                };
              }(i);
            }
          }

          // proxy certain important events.
          for (var n = 0; n < kProxyEvents.length; n++) {
            stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
          }

          // when we try to consume some more bytes, simply unpause the
          // underlying stream.
          this._read = function (n) {
            debug('wrapped _read', n);
            if (paused) {
              paused = false;
              stream.resume();
            }
          };

          return this;
        };

        Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
          // making it explicit this property is not enumerable
          // because otherwise some prototype manipulation in
          // userland will fail
          enumerable: false,
          get: function get() {
            return this._readableState.highWaterMark;
          }
        });

        // exposed for testing purposes only.
        Readable._fromList = fromList;

        // Pluck off n bytes from an array of buffers.
        // Length is the combined lengths of all the buffers in the list.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function fromList(n, state) {
          // nothing buffered
          if (state.length === 0) return null;

          var ret;
          if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
            // read it all, truncate the list
            if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
            state.buffer.clear();
          } else {
            // read part of list
            ret = fromListPartial(n, state.buffer, state.decoder);
          }

          return ret;
        }

        // Extracts only enough buffered data to satisfy the amount requested.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function fromListPartial(n, list, hasStrings) {
          var ret;
          if (n < list.head.data.length) {
            // slice is the same for buffers and strings
            ret = list.head.data.slice(0, n);
            list.head.data = list.head.data.slice(n);
          } else if (n === list.head.data.length) {
            // first chunk is a perfect match
            ret = list.shift();
          } else {
            // result spans more than one buffer
            ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
          }
          return ret;
        }

        // Copies a specified amount of characters from the list of buffered data
        // chunks.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function copyFromBufferString(n, list) {
          var p = list.head;
          var c = 1;
          var ret = p.data;
          n -= ret.length;
          while (p = p.next) {
            var str = p.data;
            var nb = n > str.length ? str.length : n;
            if (nb === str.length) ret += str;else ret += str.slice(0, n);
            n -= nb;
            if (n === 0) {
              if (nb === str.length) {
                ++c;
                if (p.next) list.head = p.next;else list.head = list.tail = null;
              } else {
                list.head = p;
                p.data = str.slice(nb);
              }
              break;
            }
            ++c;
          }
          list.length -= c;
          return ret;
        }

        // Copies a specified amount of bytes from the list of buffered data chunks.
        // This function is designed to be inlinable, so please take care when making
        // changes to the function body.
        function copyFromBuffer(n, list) {
          var ret = Buffer.allocUnsafe(n);
          var p = list.head;
          var c = 1;
          p.data.copy(ret);
          n -= p.data.length;
          while (p = p.next) {
            var buf = p.data;
            var nb = n > buf.length ? buf.length : n;
            buf.copy(ret, ret.length - n, 0, nb);
            n -= nb;
            if (n === 0) {
              if (nb === buf.length) {
                ++c;
                if (p.next) list.head = p.next;else list.head = list.tail = null;
              } else {
                list.head = p;
                p.data = buf.slice(nb);
              }
              break;
            }
            ++c;
          }
          list.length -= c;
          return ret;
        }

        function endReadable(stream) {
          var state = stream._readableState;

          // If we get here before consuming all the bytes, then that is a
          // bug in node.  Should never happen.
          if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

          if (!state.endEmitted) {
            state.ended = true;
            pna.nextTick(endReadableNT, state, stream);
          }
        }

        function endReadableNT(state, stream) {
          // Check that we didn't get one last unshift.
          if (!state.endEmitted && state.length === 0) {
            state.endEmitted = true;
            stream.readable = false;
            stream.emit('end');
          }
        }

        function indexOf(xs, x) {
          for (var i = 0, l = xs.length; i < l; i++) {
            if (xs[i] === x) return i;
          }
          return -1;
        }
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./_stream_duplex": 35, "./internal/streams/BufferList": 40, "./internal/streams/destroy": 41, "./internal/streams/stream": 42, "_process": 27, "core-util-is": 9, "events": 15, "inherits": 18, "isarray": 21, "process-nextick-args": 26, "safe-buffer": 45, "string_decoder/": 43, "util": 5 }], 38: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      // a transform stream is a readable/writable stream where you do
      // something with the data.  Sometimes it's called a "filter",
      // but that's not a great name for it, since that implies a thing where
      // some bits pass through, and others are simply ignored.  (That would
      // be a valid example of a transform, of course.)
      //
      // While the output is causally related to the input, it's not a
      // necessarily symmetric or synchronous transformation.  For example,
      // a zlib stream might take multiple plain-text writes(), and then
      // emit a single compressed chunk some time in the future.
      //
      // Here's how this works:
      //
      // The Transform stream has all the aspects of the readable and writable
      // stream classes.  When you write(chunk), that calls _write(chunk,cb)
      // internally, and returns false if there's a lot of pending writes
      // buffered up.  When you call read(), that calls _read(n) until
      // there's enough pending readable data buffered up.
      //
      // In a transform stream, the written data is placed in a buffer.  When
      // _read(n) is called, it transforms the queued up data, calling the
      // buffered _write cb's as it consumes chunks.  If consuming a single
      // written chunk would result in multiple output chunks, then the first
      // outputted bit calls the readcb, and subsequent chunks just go into
      // the read buffer, and will cause it to emit 'readable' if necessary.
      //
      // This way, back-pressure is actually determined by the reading side,
      // since _read has to be called to start processing a new chunk.  However,
      // a pathological inflate type of transform can cause excessive buffering
      // here.  For example, imagine a stream where every byte of input is
      // interpreted as an integer from 0-255, and then results in that many
      // bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
      // 1kb of data being output.  In this case, you could write a very small
      // amount of input, and end up with a very large amount of output.  In
      // such a pathological inflating mechanism, there'd be no way to tell
      // the system to stop doing the transform.  A single 4MB write could
      // cause the system to run out of memory.
      //
      // However, even in such a pathological case, only a single written chunk
      // would be consumed, and then the rest would wait (un-transformed) until
      // the results of the previous transformed chunk were consumed.

      'use strict';

      module.exports = Transform;

      var Duplex = require('./_stream_duplex');

      /*<replacement>*/
      var util = require('core-util-is');
      util.inherits = require('inherits');
      /*</replacement>*/

      util.inherits(Transform, Duplex);

      function afterTransform(er, data) {
        var ts = this._transformState;
        ts.transforming = false;

        var cb = ts.writecb;

        if (!cb) {
          return this.emit('error', new Error('write callback called multiple times'));
        }

        ts.writechunk = null;
        ts.writecb = null;

        if (data != null) // single equals check for both `null` and `undefined`
          this.push(data);

        cb(er);

        var rs = this._readableState;
        rs.reading = false;
        if (rs.needReadable || rs.length < rs.highWaterMark) {
          this._read(rs.highWaterMark);
        }
      }

      function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);

        Duplex.call(this, options);

        this._transformState = {
          afterTransform: afterTransform.bind(this),
          needTransform: false,
          transforming: false,
          writecb: null,
          writechunk: null,
          writeencoding: null
        };

        // start out asking for a readable event once data is transformed.
        this._readableState.needReadable = true;

        // we have implemented the _read method, and done the other things
        // that Readable wants before the first _read call, so unset the
        // sync guard flag.
        this._readableState.sync = false;

        if (options) {
          if (typeof options.transform === 'function') this._transform = options.transform;

          if (typeof options.flush === 'function') this._flush = options.flush;
        }

        // When the writable side finishes, then flush out anything remaining.
        this.on('prefinish', prefinish);
      }

      function prefinish() {
        var _this = this;

        if (typeof this._flush === 'function') {
          this._flush(function (er, data) {
            done(_this, er, data);
          });
        } else {
          done(this, null, null);
        }
      }

      Transform.prototype.push = function (chunk, encoding) {
        this._transformState.needTransform = false;
        return Duplex.prototype.push.call(this, chunk, encoding);
      };

      // This is the part where you do stuff!
      // override this function in implementation classes.
      // 'chunk' is an input chunk.
      //
      // Call `push(newChunk)` to pass along transformed output
      // to the readable side.  You may call 'push' zero or more times.
      //
      // Call `cb(err)` when you are done with this chunk.  If you pass
      // an error, then that'll put the hurt on the whole operation.  If you
      // never call cb(), then you'll never get another chunk.
      Transform.prototype._transform = function (chunk, encoding, cb) {
        throw new Error('_transform() is not implemented');
      };

      Transform.prototype._write = function (chunk, encoding, cb) {
        var ts = this._transformState;
        ts.writecb = cb;
        ts.writechunk = chunk;
        ts.writeencoding = encoding;
        if (!ts.transforming) {
          var rs = this._readableState;
          if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
        }
      };

      // Doesn't matter what the args are here.
      // _transform does all the work.
      // That we got here means that the readable side wants more data.
      Transform.prototype._read = function (n) {
        var ts = this._transformState;

        if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
          ts.transforming = true;
          this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
        } else {
          // mark that we need a transform, so that any data that comes in
          // will get processed, now that we've asked for it.
          ts.needTransform = true;
        }
      };

      Transform.prototype._destroy = function (err, cb) {
        var _this2 = this;

        Duplex.prototype._destroy.call(this, err, function (err2) {
          cb(err2);
          _this2.emit('close');
        });
      };

      function done(stream, er, data) {
        if (er) return stream.emit('error', er);

        if (data != null) // single equals check for both `null` and `undefined`
          stream.push(data);

        // if there's nothing in the write buffer, then that means
        // that nothing more will ever be provided
        if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

        if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

        return stream.push(null);
      }
    }, { "./_stream_duplex": 35, "core-util-is": 9, "inherits": 18 }], 39: [function (require, module, exports) {
      (function (process, global, setImmediate) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // A bit simpler than readable streams.
        // Implement an async ._write(chunk, encoding, cb), and it'll handle all
        // the drain event emission and buffering.

        'use strict';

        /*<replacement>*/

        var pna = require('process-nextick-args');
        /*</replacement>*/

        module.exports = Writable;

        /* <replacement> */
        function WriteReq(chunk, encoding, cb) {
          this.chunk = chunk;
          this.encoding = encoding;
          this.callback = cb;
          this.next = null;
        }

        // It seems a linked list but it is not
        // there will be only 2 of these for each stream
        function CorkedRequest(state) {
          var _this = this;

          this.next = null;
          this.entry = null;
          this.finish = function () {
            onCorkedFinish(_this, state);
          };
        }
        /* </replacement> */

        /*<replacement>*/
        var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
        /*</replacement>*/

        /*<replacement>*/
        var Duplex;
        /*</replacement>*/

        Writable.WritableState = WritableState;

        /*<replacement>*/
        var util = require('core-util-is');
        util.inherits = require('inherits');
        /*</replacement>*/

        /*<replacement>*/
        var internalUtil = {
          deprecate: require('util-deprecate')
        };
        /*</replacement>*/

        /*<replacement>*/
        var Stream = require('./internal/streams/stream');
        /*</replacement>*/

        /*<replacement>*/

        var Buffer = require('safe-buffer').Buffer;
        var OurUint8Array = global.Uint8Array || function () {};
        function _uint8ArrayToBuffer(chunk) {
          return Buffer.from(chunk);
        }
        function _isUint8Array(obj) {
          return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
        }

        /*</replacement>*/

        var destroyImpl = require('./internal/streams/destroy');

        util.inherits(Writable, Stream);

        function nop() {}

        function WritableState(options, stream) {
          Duplex = Duplex || require('./_stream_duplex');

          options = options || {};

          // Duplex streams are both readable and writable, but share
          // the same options object.
          // However, some cases require setting options to different
          // values for the readable and the writable sides of the duplex stream.
          // These options can be provided separately as readableXXX and writableXXX.
          var isDuplex = stream instanceof Duplex;

          // object stream flag to indicate whether or not this stream
          // contains buffers or objects.
          this.objectMode = !!options.objectMode;

          if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

          // the point at which write() starts returning false
          // Note: 0 is a valid value, means that we always return false if
          // the entire buffer is not flushed immediately on write()
          var hwm = options.highWaterMark;
          var writableHwm = options.writableHighWaterMark;
          var defaultHwm = this.objectMode ? 16 : 16 * 1024;

          if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

          // cast to ints.
          this.highWaterMark = Math.floor(this.highWaterMark);

          // if _final has been called
          this.finalCalled = false;

          // drain event flag.
          this.needDrain = false;
          // at the start of calling end()
          this.ending = false;
          // when end() has been called, and returned
          this.ended = false;
          // when 'finish' is emitted
          this.finished = false;

          // has it been destroyed
          this.destroyed = false;

          // should we decode strings into buffers before passing to _write?
          // this is here so that some node-core streams can optimize string
          // handling at a lower level.
          var noDecode = options.decodeStrings === false;
          this.decodeStrings = !noDecode;

          // Crypto is kind of old and crusty.  Historically, its default string
          // encoding is 'binary' so we have to make this configurable.
          // Everything else in the universe uses 'utf8', though.
          this.defaultEncoding = options.defaultEncoding || 'utf8';

          // not an actual buffer we keep track of, but a measurement
          // of how much we're waiting to get pushed to some underlying
          // socket or file.
          this.length = 0;

          // a flag to see when we're in the middle of a write.
          this.writing = false;

          // when true all writes will be buffered until .uncork() call
          this.corked = 0;

          // a flag to be able to tell if the onwrite cb is called immediately,
          // or on a later tick.  We set this to true at first, because any
          // actions that shouldn't happen until "later" should generally also
          // not happen before the first write call.
          this.sync = true;

          // a flag to know if we're processing previously buffered items, which
          // may call the _write() callback in the same tick, so that we don't
          // end up in an overlapped onwrite situation.
          this.bufferProcessing = false;

          // the callback that's passed to _write(chunk,cb)
          this.onwrite = function (er) {
            onwrite(stream, er);
          };

          // the callback that the user supplies to write(chunk,encoding,cb)
          this.writecb = null;

          // the amount that is being written when _write is called.
          this.writelen = 0;

          this.bufferedRequest = null;
          this.lastBufferedRequest = null;

          // number of pending user-supplied write callbacks
          // this must be 0 before 'finish' can be emitted
          this.pendingcb = 0;

          // emit prefinish if the only thing we're waiting for is _write cbs
          // This is relevant for synchronous Transform streams
          this.prefinished = false;

          // True if the error was already emitted and should not be thrown again
          this.errorEmitted = false;

          // count buffered requests
          this.bufferedRequestCount = 0;

          // allocate the first CorkedRequest, there is always
          // one allocated and free to use, and we maintain at most two
          this.corkedRequestsFree = new CorkedRequest(this);
        }

        WritableState.prototype.getBuffer = function getBuffer() {
          var current = this.bufferedRequest;
          var out = [];
          while (current) {
            out.push(current);
            current = current.next;
          }
          return out;
        };

        (function () {
          try {
            Object.defineProperty(WritableState.prototype, 'buffer', {
              get: internalUtil.deprecate(function () {
                return this.getBuffer();
              }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
            });
          } catch (_) {}
        })();

        // Test _writableState for inheritance to account for Duplex streams,
        // whose prototype chain only points to Readable.
        var realHasInstance;
        if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
          realHasInstance = Function.prototype[Symbol.hasInstance];
          Object.defineProperty(Writable, Symbol.hasInstance, {
            value: function value(object) {
              if (realHasInstance.call(this, object)) return true;
              if (this !== Writable) return false;

              return object && object._writableState instanceof WritableState;
            }
          });
        } else {
          realHasInstance = function realHasInstance(object) {
            return object instanceof this;
          };
        }

        function Writable(options) {
          Duplex = Duplex || require('./_stream_duplex');

          // Writable ctor is applied to Duplexes, too.
          // `realHasInstance` is necessary because using plain `instanceof`
          // would return false, as no `_writableState` property is attached.

          // Trying to use the custom `instanceof` for Writable here will also break the
          // Node.js LazyTransform implementation, which has a non-trivial getter for
          // `_writableState` that would lead to infinite recursion.
          if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
            return new Writable(options);
          }

          this._writableState = new WritableState(options, this);

          // legacy.
          this.writable = true;

          if (options) {
            if (typeof options.write === 'function') this._write = options.write;

            if (typeof options.writev === 'function') this._writev = options.writev;

            if (typeof options.destroy === 'function') this._destroy = options.destroy;

            if (typeof options.final === 'function') this._final = options.final;
          }

          Stream.call(this);
        }

        // Otherwise people can pipe Writable streams, which is just wrong.
        Writable.prototype.pipe = function () {
          this.emit('error', new Error('Cannot pipe, not readable'));
        };

        function writeAfterEnd(stream, cb) {
          var er = new Error('write after end');
          // TODO: defer error events consistently everywhere, not just the cb
          stream.emit('error', er);
          pna.nextTick(cb, er);
        }

        // Checks that a user-supplied chunk is valid, especially for the particular
        // mode the stream is in. Currently this means that `null` is never accepted
        // and undefined/non-string values are only allowed in object mode.
        function validChunk(stream, state, chunk, cb) {
          var valid = true;
          var er = false;

          if (chunk === null) {
            er = new TypeError('May not write null values to stream');
          } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
            er = new TypeError('Invalid non-string/buffer chunk');
          }
          if (er) {
            stream.emit('error', er);
            pna.nextTick(cb, er);
            valid = false;
          }
          return valid;
        }

        Writable.prototype.write = function (chunk, encoding, cb) {
          var state = this._writableState;
          var ret = false;
          var isBuf = !state.objectMode && _isUint8Array(chunk);

          if (isBuf && !Buffer.isBuffer(chunk)) {
            chunk = _uint8ArrayToBuffer(chunk);
          }

          if (typeof encoding === 'function') {
            cb = encoding;
            encoding = null;
          }

          if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

          if (typeof cb !== 'function') cb = nop;

          if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
            state.pendingcb++;
            ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
          }

          return ret;
        };

        Writable.prototype.cork = function () {
          var state = this._writableState;

          state.corked++;
        };

        Writable.prototype.uncork = function () {
          var state = this._writableState;

          if (state.corked) {
            state.corked--;

            if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
          }
        };

        Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
          // node::ParseEncoding() requires lower case.
          if (typeof encoding === 'string') encoding = encoding.toLowerCase();
          if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
          this._writableState.defaultEncoding = encoding;
          return this;
        };

        function decodeChunk(state, chunk, encoding) {
          if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
            chunk = Buffer.from(chunk, encoding);
          }
          return chunk;
        }

        Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
          // making it explicit this property is not enumerable
          // because otherwise some prototype manipulation in
          // userland will fail
          enumerable: false,
          get: function get() {
            return this._writableState.highWaterMark;
          }
        });

        // if we're already writing something, then just put this
        // in the queue, and wait our turn.  Otherwise, call _write
        // If we return false, then we need a drain event, so set that flag.
        function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
          if (!isBuf) {
            var newChunk = decodeChunk(state, chunk, encoding);
            if (chunk !== newChunk) {
              isBuf = true;
              encoding = 'buffer';
              chunk = newChunk;
            }
          }
          var len = state.objectMode ? 1 : chunk.length;

          state.length += len;

          var ret = state.length < state.highWaterMark;
          // we must ensure that previous needDrain will not be reset to false.
          if (!ret) state.needDrain = true;

          if (state.writing || state.corked) {
            var last = state.lastBufferedRequest;
            state.lastBufferedRequest = {
              chunk: chunk,
              encoding: encoding,
              isBuf: isBuf,
              callback: cb,
              next: null
            };
            if (last) {
              last.next = state.lastBufferedRequest;
            } else {
              state.bufferedRequest = state.lastBufferedRequest;
            }
            state.bufferedRequestCount += 1;
          } else {
            doWrite(stream, state, false, len, chunk, encoding, cb);
          }

          return ret;
        }

        function doWrite(stream, state, writev, len, chunk, encoding, cb) {
          state.writelen = len;
          state.writecb = cb;
          state.writing = true;
          state.sync = true;
          if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
          state.sync = false;
        }

        function onwriteError(stream, state, sync, er, cb) {
          --state.pendingcb;

          if (sync) {
            // defer the callback if we are being called synchronously
            // to avoid piling up things on the stack
            pna.nextTick(cb, er);
            // this can emit finish, and it will always happen
            // after error
            pna.nextTick(finishMaybe, stream, state);
            stream._writableState.errorEmitted = true;
            stream.emit('error', er);
          } else {
            // the caller expect this to happen before if
            // it is async
            cb(er);
            stream._writableState.errorEmitted = true;
            stream.emit('error', er);
            // this can emit finish, but finish must
            // always follow error
            finishMaybe(stream, state);
          }
        }

        function onwriteStateUpdate(state) {
          state.writing = false;
          state.writecb = null;
          state.length -= state.writelen;
          state.writelen = 0;
        }

        function onwrite(stream, er) {
          var state = stream._writableState;
          var sync = state.sync;
          var cb = state.writecb;

          onwriteStateUpdate(state);

          if (er) onwriteError(stream, state, sync, er, cb);else {
            // Check if we're actually ready to finish, but don't emit yet
            var finished = needFinish(state);

            if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
              clearBuffer(stream, state);
            }

            if (sync) {
              /*<replacement>*/
              asyncWrite(afterWrite, stream, state, finished, cb);
              /*</replacement>*/
            } else {
              afterWrite(stream, state, finished, cb);
            }
          }
        }

        function afterWrite(stream, state, finished, cb) {
          if (!finished) onwriteDrain(stream, state);
          state.pendingcb--;
          cb();
          finishMaybe(stream, state);
        }

        // Must force callback to be called on nextTick, so that we don't
        // emit 'drain' before the write() consumer gets the 'false' return
        // value, and has a chance to attach a 'drain' listener.
        function onwriteDrain(stream, state) {
          if (state.length === 0 && state.needDrain) {
            state.needDrain = false;
            stream.emit('drain');
          }
        }

        // if there's something in the buffer waiting, then process it
        function clearBuffer(stream, state) {
          state.bufferProcessing = true;
          var entry = state.bufferedRequest;

          if (stream._writev && entry && entry.next) {
            // Fast case, write everything using _writev()
            var l = state.bufferedRequestCount;
            var buffer = new Array(l);
            var holder = state.corkedRequestsFree;
            holder.entry = entry;

            var count = 0;
            var allBuffers = true;
            while (entry) {
              buffer[count] = entry;
              if (!entry.isBuf) allBuffers = false;
              entry = entry.next;
              count += 1;
            }
            buffer.allBuffers = allBuffers;

            doWrite(stream, state, true, state.length, buffer, '', holder.finish);

            // doWrite is almost always async, defer these to save a bit of time
            // as the hot path ends with doWrite
            state.pendingcb++;
            state.lastBufferedRequest = null;
            if (holder.next) {
              state.corkedRequestsFree = holder.next;
              holder.next = null;
            } else {
              state.corkedRequestsFree = new CorkedRequest(state);
            }
            state.bufferedRequestCount = 0;
          } else {
            // Slow case, write chunks one-by-one
            while (entry) {
              var chunk = entry.chunk;
              var encoding = entry.encoding;
              var cb = entry.callback;
              var len = state.objectMode ? 1 : chunk.length;

              doWrite(stream, state, false, len, chunk, encoding, cb);
              entry = entry.next;
              state.bufferedRequestCount--;
              // if we didn't call the onwrite immediately, then
              // it means that we need to wait until it does.
              // also, that means that the chunk and cb are currently
              // being processed, so move the buffer counter past them.
              if (state.writing) {
                break;
              }
            }

            if (entry === null) state.lastBufferedRequest = null;
          }

          state.bufferedRequest = entry;
          state.bufferProcessing = false;
        }

        Writable.prototype._write = function (chunk, encoding, cb) {
          cb(new Error('_write() is not implemented'));
        };

        Writable.prototype._writev = null;

        Writable.prototype.end = function (chunk, encoding, cb) {
          var state = this._writableState;

          if (typeof chunk === 'function') {
            cb = chunk;
            chunk = null;
            encoding = null;
          } else if (typeof encoding === 'function') {
            cb = encoding;
            encoding = null;
          }

          if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

          // .end() fully uncorks
          if (state.corked) {
            state.corked = 1;
            this.uncork();
          }

          // ignore unnecessary end() calls.
          if (!state.ending && !state.finished) endWritable(this, state, cb);
        };

        function needFinish(state) {
          return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
        }
        function callFinal(stream, state) {
          stream._final(function (err) {
            state.pendingcb--;
            if (err) {
              stream.emit('error', err);
            }
            state.prefinished = true;
            stream.emit('prefinish');
            finishMaybe(stream, state);
          });
        }
        function prefinish(stream, state) {
          if (!state.prefinished && !state.finalCalled) {
            if (typeof stream._final === 'function') {
              state.pendingcb++;
              state.finalCalled = true;
              pna.nextTick(callFinal, stream, state);
            } else {
              state.prefinished = true;
              stream.emit('prefinish');
            }
          }
        }

        function finishMaybe(stream, state) {
          var need = needFinish(state);
          if (need) {
            prefinish(stream, state);
            if (state.pendingcb === 0) {
              state.finished = true;
              stream.emit('finish');
            }
          }
          return need;
        }

        function endWritable(stream, state, cb) {
          state.ending = true;
          finishMaybe(stream, state);
          if (cb) {
            if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
          }
          state.ended = true;
          stream.writable = false;
        }

        function onCorkedFinish(corkReq, state, err) {
          var entry = corkReq.entry;
          corkReq.entry = null;
          while (entry) {
            var cb = entry.callback;
            state.pendingcb--;
            cb(err);
            entry = entry.next;
          }
          if (state.corkedRequestsFree) {
            state.corkedRequestsFree.next = corkReq;
          } else {
            state.corkedRequestsFree = corkReq;
          }
        }

        Object.defineProperty(Writable.prototype, 'destroyed', {
          get: function get() {
            if (this._writableState === undefined) {
              return false;
            }
            return this._writableState.destroyed;
          },
          set: function set(value) {
            // we ignore the value if the stream
            // has not been initialized yet
            if (!this._writableState) {
              return;
            }

            // backward compatibility, the user is explicitly
            // managing destroyed
            this._writableState.destroyed = value;
          }
        });

        Writable.prototype.destroy = destroyImpl.destroy;
        Writable.prototype._undestroy = destroyImpl.undestroy;
        Writable.prototype._destroy = function (err, cb) {
          this.end();
          cb(err);
        };
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("timers").setImmediate);
    }, { "./_stream_duplex": 35, "./internal/streams/destroy": 41, "./internal/streams/stream": 42, "_process": 27, "core-util-is": 9, "inherits": 18, "process-nextick-args": 26, "safe-buffer": 45, "timers": 51, "util-deprecate": 57 }], 40: [function (require, module, exports) {
      'use strict';

      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      var Buffer = require('safe-buffer').Buffer;
      var util = require('util');

      function copyBuffer(src, target, offset) {
        src.copy(target, offset);
      }

      module.exports = function () {
        function BufferList() {
          _classCallCheck(this, BufferList);

          this.head = null;
          this.tail = null;
          this.length = 0;
        }

        BufferList.prototype.push = function push(v) {
          var entry = { data: v, next: null };
          if (this.length > 0) this.tail.next = entry;else this.head = entry;
          this.tail = entry;
          ++this.length;
        };

        BufferList.prototype.unshift = function unshift(v) {
          var entry = { data: v, next: this.head };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        };

        BufferList.prototype.shift = function shift() {
          if (this.length === 0) return;
          var ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
          --this.length;
          return ret;
        };

        BufferList.prototype.clear = function clear() {
          this.head = this.tail = null;
          this.length = 0;
        };

        BufferList.prototype.join = function join(s) {
          if (this.length === 0) return '';
          var p = this.head;
          var ret = '' + p.data;
          while (p = p.next) {
            ret += s + p.data;
          }return ret;
        };

        BufferList.prototype.concat = function concat(n) {
          if (this.length === 0) return Buffer.alloc(0);
          if (this.length === 1) return this.head.data;
          var ret = Buffer.allocUnsafe(n >>> 0);
          var p = this.head;
          var i = 0;
          while (p) {
            copyBuffer(p.data, ret, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        };

        return BufferList;
      }();

      if (util && util.inspect && util.inspect.custom) {
        module.exports.prototype[util.inspect.custom] = function () {
          var obj = util.inspect({ length: this.length });
          return this.constructor.name + ' ' + obj;
        };
      }
    }, { "safe-buffer": 45, "util": 5 }], 41: [function (require, module, exports) {
      'use strict';

      /*<replacement>*/

      var pna = require('process-nextick-args');
      /*</replacement>*/

      // undocumented cb() API, needed for core, not for public API
      function destroy(err, cb) {
        var _this = this;

        var readableDestroyed = this._readableState && this._readableState.destroyed;
        var writableDestroyed = this._writableState && this._writableState.destroyed;

        if (readableDestroyed || writableDestroyed) {
          if (cb) {
            cb(err);
          } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
            pna.nextTick(emitErrorNT, this, err);
          }
          return this;
        }

        // we set destroyed to true before firing error callbacks in order
        // to make it re-entrance safe in case destroy() is called within callbacks

        if (this._readableState) {
          this._readableState.destroyed = true;
        }

        // if this is a duplex stream mark the writable part as destroyed as well
        if (this._writableState) {
          this._writableState.destroyed = true;
        }

        this._destroy(err || null, function (err) {
          if (!cb && err) {
            pna.nextTick(emitErrorNT, _this, err);
            if (_this._writableState) {
              _this._writableState.errorEmitted = true;
            }
          } else if (cb) {
            cb(err);
          }
        });

        return this;
      }

      function undestroy() {
        if (this._readableState) {
          this._readableState.destroyed = false;
          this._readableState.reading = false;
          this._readableState.ended = false;
          this._readableState.endEmitted = false;
        }

        if (this._writableState) {
          this._writableState.destroyed = false;
          this._writableState.ended = false;
          this._writableState.ending = false;
          this._writableState.finished = false;
          this._writableState.errorEmitted = false;
        }
      }

      function emitErrorNT(self, err) {
        self.emit('error', err);
      }

      module.exports = {
        destroy: destroy,
        undestroy: undestroy
      };
    }, { "process-nextick-args": 26 }], 42: [function (require, module, exports) {
      module.exports = require('events').EventEmitter;
    }, { "events": 15 }], 43: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      'use strict';

      /*<replacement>*/

      var Buffer = require('safe-buffer').Buffer;
      /*</replacement>*/

      var isEncoding = Buffer.isEncoding || function (encoding) {
        encoding = '' + encoding;
        switch (encoding && encoding.toLowerCase()) {
          case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
            return true;
          default:
            return false;
        }
      };

      function _normalizeEncoding(enc) {
        if (!enc) return 'utf8';
        var retried;
        while (true) {
          switch (enc) {
            case 'utf8':
            case 'utf-8':
              return 'utf8';
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return 'utf16le';
            case 'latin1':
            case 'binary':
              return 'latin1';
            case 'base64':
            case 'ascii':
            case 'hex':
              return enc;
            default:
              if (retried) return; // undefined
              enc = ('' + enc).toLowerCase();
              retried = true;
          }
        }
      };

      // Do not cache `Buffer.isEncoding` when checking encoding names as some
      // modules monkey-patch it to support additional encodings
      function normalizeEncoding(enc) {
        var nenc = _normalizeEncoding(enc);
        if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
        return nenc || enc;
      }

      // StringDecoder provides an interface for efficiently splitting a series of
      // buffers into a series of JS strings without breaking apart multi-byte
      // characters.
      exports.StringDecoder = StringDecoder;
      function StringDecoder(encoding) {
        this.encoding = normalizeEncoding(encoding);
        var nb;
        switch (this.encoding) {
          case 'utf16le':
            this.text = utf16Text;
            this.end = utf16End;
            nb = 4;
            break;
          case 'utf8':
            this.fillLast = utf8FillLast;
            nb = 4;
            break;
          case 'base64':
            this.text = base64Text;
            this.end = base64End;
            nb = 3;
            break;
          default:
            this.write = simpleWrite;
            this.end = simpleEnd;
            return;
        }
        this.lastNeed = 0;
        this.lastTotal = 0;
        this.lastChar = Buffer.allocUnsafe(nb);
      }

      StringDecoder.prototype.write = function (buf) {
        if (buf.length === 0) return '';
        var r;
        var i;
        if (this.lastNeed) {
          r = this.fillLast(buf);
          if (r === undefined) return '';
          i = this.lastNeed;
          this.lastNeed = 0;
        } else {
          i = 0;
        }
        if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
        return r || '';
      };

      StringDecoder.prototype.end = utf8End;

      // Returns only complete characters in a Buffer
      StringDecoder.prototype.text = utf8Text;

      // Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
      StringDecoder.prototype.fillLast = function (buf) {
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
        this.lastNeed -= buf.length;
      };

      // Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
      // continuation byte. If an invalid byte is detected, -2 is returned.
      function utf8CheckByte(byte) {
        if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
        return byte >> 6 === 0x02 ? -1 : -2;
      }

      // Checks at most 3 bytes at the end of a Buffer in order to detect an
      // incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
      // needed to complete the UTF-8 character (if applicable) are returned.
      function utf8CheckIncomplete(self, buf, i) {
        var j = buf.length - 1;
        if (j < i) return 0;
        var nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self.lastNeed = nb - 1;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self.lastNeed = nb - 2;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) {
            if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
          }
          return nb;
        }
        return 0;
      }

      // Validates as many continuation bytes for a multi-byte UTF-8 character as
      // needed or are available. If we see a non-continuation byte where we expect
      // one, we "replace" the validated continuation bytes we've seen so far with
      // a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
      // behavior. The continuation byte check is included three times in the case
      // where all of the continuation bytes for a character exist in the same buffer.
      // It is also done this way as a slight performance increase instead of using a
      // loop.
      function utf8CheckExtraBytes(self, buf, p) {
        if ((buf[0] & 0xC0) !== 0x80) {
          self.lastNeed = 0;
          return "\uFFFD";
        }
        if (self.lastNeed > 1 && buf.length > 1) {
          if ((buf[1] & 0xC0) !== 0x80) {
            self.lastNeed = 1;
            return "\uFFFD";
          }
          if (self.lastNeed > 2 && buf.length > 2) {
            if ((buf[2] & 0xC0) !== 0x80) {
              self.lastNeed = 2;
              return "\uFFFD";
            }
          }
        }
      }

      // Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
      function utf8FillLast(buf) {
        var p = this.lastTotal - this.lastNeed;
        var r = utf8CheckExtraBytes(this, buf, p);
        if (r !== undefined) return r;
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, p, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, p, 0, buf.length);
        this.lastNeed -= buf.length;
      }

      // Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
      // partial character, the character's bytes are buffered until the required
      // number of bytes are available.
      function utf8Text(buf, i) {
        var total = utf8CheckIncomplete(this, buf, i);
        if (!this.lastNeed) return buf.toString('utf8', i);
        this.lastTotal = total;
        var end = buf.length - (total - this.lastNeed);
        buf.copy(this.lastChar, 0, end);
        return buf.toString('utf8', i, end);
      }

      // For UTF-8, a replacement character is added when ending on a partial
      // character.
      function utf8End(buf) {
        var r = buf && buf.length ? this.write(buf) : '';
        if (this.lastNeed) return r + "\uFFFD";
        return r;
      }

      // UTF-16LE typically needs two bytes per character, but even if we have an even
      // number of bytes available, we need to check if we end on a leading/high
      // surrogate. In that case, we need to wait for the next two bytes in order to
      // decode the last character properly.
      function utf16Text(buf, i) {
        if ((buf.length - i) % 2 === 0) {
          var r = buf.toString('utf16le', i);
          if (r) {
            var c = r.charCodeAt(r.length - 1);
            if (c >= 0xD800 && c <= 0xDBFF) {
              this.lastNeed = 2;
              this.lastTotal = 4;
              this.lastChar[0] = buf[buf.length - 2];
              this.lastChar[1] = buf[buf.length - 1];
              return r.slice(0, -1);
            }
          }
          return r;
        }
        this.lastNeed = 1;
        this.lastTotal = 2;
        this.lastChar[0] = buf[buf.length - 1];
        return buf.toString('utf16le', i, buf.length - 1);
      }

      // For UTF-16LE we do not explicitly append special replacement characters if we
      // end on a partial character, we simply let v8 handle that.
      function utf16End(buf) {
        var r = buf && buf.length ? this.write(buf) : '';
        if (this.lastNeed) {
          var end = this.lastTotal - this.lastNeed;
          return r + this.lastChar.toString('utf16le', 0, end);
        }
        return r;
      }

      function base64Text(buf, i) {
        var n = (buf.length - i) % 3;
        if (n === 0) return buf.toString('base64', i);
        this.lastNeed = 3 - n;
        this.lastTotal = 3;
        if (n === 1) {
          this.lastChar[0] = buf[buf.length - 1];
        } else {
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
        }
        return buf.toString('base64', i, buf.length - n);
      }

      function base64End(buf) {
        var r = buf && buf.length ? this.write(buf) : '';
        if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
        return r;
      }

      // Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
      function simpleWrite(buf) {
        return buf.toString(this.encoding);
      }

      function simpleEnd(buf) {
        return buf && buf.length ? this.write(buf) : '';
      }
    }, { "safe-buffer": 45 }], 44: [function (require, module, exports) {
      exports = module.exports = require('./lib/_stream_readable.js');
      exports.Stream = exports;
      exports.Readable = exports;
      exports.Writable = require('./lib/_stream_writable.js');
      exports.Duplex = require('./lib/_stream_duplex.js');
      exports.Transform = require('./lib/_stream_transform.js');
      exports.PassThrough = require('./lib/_stream_passthrough.js');
    }, { "./lib/_stream_duplex.js": 35, "./lib/_stream_passthrough.js": 36, "./lib/_stream_readable.js": 37, "./lib/_stream_transform.js": 38, "./lib/_stream_writable.js": 39 }], 45: [function (require, module, exports) {
      /* eslint-disable node/no-deprecated-api */
      var buffer = require('buffer');
      var Buffer = buffer.Buffer;

      // alternative to using Object.keys for old browsers
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        // Copy properties from require('buffer')
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }

      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer(arg, encodingOrOffset, length);
      }

      // Copy static methods from Buffer
      copyProps(Buffer, SafeBuffer);

      SafeBuffer.from = function (arg, encodingOrOffset, length) {
        if (typeof arg === 'number') {
          throw new TypeError('Argument must not be a number');
        }
        return Buffer(arg, encodingOrOffset, length);
      };

      SafeBuffer.alloc = function (size, fill, encoding) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        var buf = Buffer(size);
        if (fill !== undefined) {
          if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };

      SafeBuffer.allocUnsafe = function (size) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        return Buffer(size);
      };

      SafeBuffer.allocUnsafeSlow = function (size) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        return buffer.SlowBuffer(size);
      };
    }, { "buffer": 6 }], 46: [function (require, module, exports) {
      (function (global) {
        var ClientRequest = require('./lib/request');
        var response = require('./lib/response');
        var extend = require('xtend');
        var statusCodes = require('builtin-status-codes');
        var url = require('url');

        var http = exports;

        http.request = function (opts, cb) {
          if (typeof opts === 'string') opts = url.parse(opts);else opts = extend(opts);

          // Normally, the page is loaded from http or https, so not specifying a protocol
          // will result in a (valid) protocol-relative url. However, this won't work if
          // the protocol is something else, like 'file:'
          var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';

          var protocol = opts.protocol || defaultProtocol;
          var host = opts.hostname || opts.host;
          var port = opts.port;
          var path = opts.path || '/';

          // Necessary for IPv6 addresses
          if (host && host.indexOf(':') !== -1) host = '[' + host + ']';

          // This may be a relative url. The browser should always be able to interpret it correctly.
          opts.url = (host ? protocol + '//' + host : '') + (port ? ':' + port : '') + path;
          opts.method = (opts.method || 'GET').toUpperCase();
          opts.headers = opts.headers || {};

          // Also valid opts.auth, opts.mode

          var req = new ClientRequest(opts);
          if (cb) req.on('response', cb);
          return req;
        };

        http.get = function get(opts, cb) {
          var req = http.request(opts, cb);
          req.end();
          return req;
        };

        http.ClientRequest = ClientRequest;
        http.IncomingMessage = response.IncomingMessage;

        http.Agent = function () {};
        http.Agent.defaultMaxSockets = 4;

        http.globalAgent = new http.Agent();

        http.STATUS_CODES = statusCodes;

        http.METHODS = ['CHECKOUT', 'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'LOCK', 'M-SEARCH', 'MERGE', 'MKACTIVITY', 'MKCOL', 'MOVE', 'NOTIFY', 'OPTIONS', 'PATCH', 'POST', 'PROPFIND', 'PROPPATCH', 'PURGE', 'PUT', 'REPORT', 'SEARCH', 'SUBSCRIBE', 'TRACE', 'UNLOCK', 'UNSUBSCRIBE'];
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./lib/request": 48, "./lib/response": 49, "builtin-status-codes": 7, "url": 54, "xtend": 67 }], 47: [function (require, module, exports) {
      (function (global) {
        exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream);

        exports.writableStream = isFunction(global.WritableStream);

        exports.abortController = isFunction(global.AbortController);

        exports.blobConstructor = false;
        try {
          new Blob([new ArrayBuffer(1)]);
          exports.blobConstructor = true;
        } catch (e) {}

        // The xhr request to example.com may violate some restrictive CSP configurations,
        // so if we're running in a browser that supports `fetch`, avoid calling getXHR()
        // and assume support for certain features below.
        var xhr;
        function getXHR() {
          // Cache the xhr value
          if (xhr !== undefined) return xhr;

          if (global.XMLHttpRequest) {
            xhr = new global.XMLHttpRequest();
            // If XDomainRequest is available (ie only, where xhr might not work
            // cross domain), use the page location. Otherwise use example.com
            // Note: this doesn't actually make an http request.
            try {
              xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com');
            } catch (e) {
              xhr = null;
            }
          } else {
            // Service workers don't have XHR
            xhr = null;
          }
          return xhr;
        }

        function checkTypeSupport(type) {
          var xhr = getXHR();
          if (!xhr) return false;
          try {
            xhr.responseType = type;
            return xhr.responseType === type;
          } catch (e) {}
          return false;
        }

        // For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
        // Safari 7.1 appears to have fixed this bug.
        var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined';
        var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice);

        // If fetch is supported, then arraybuffer will be supported too. Skip calling
        // checkTypeSupport(), since that calls getXHR().
        exports.arraybuffer = exports.fetch || haveArrayBuffer && checkTypeSupport('arraybuffer');

        // These next two tests unavoidably show warnings in Chrome. Since fetch will always
        // be used if it's available, just return false for these to avoid the warnings.
        exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream');
        exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer && checkTypeSupport('moz-chunked-arraybuffer');

        // If fetch is supported, then overrideMimeType will be supported too. Skip calling
        // getXHR().
        exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false);

        exports.vbArray = isFunction(global.VBArray);

        function isFunction(value) {
          return typeof value === 'function';
        }

        xhr = null; // Help gc
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 48: [function (require, module, exports) {
      (function (process, global, Buffer) {
        var capability = require('./capability');
        var inherits = require('inherits');
        var response = require('./response');
        var stream = require('readable-stream');
        var toArrayBuffer = require('to-arraybuffer');

        var IncomingMessage = response.IncomingMessage;
        var rStates = response.readyStates;

        function decideMode(preferBinary, useFetch) {
          if (capability.fetch && useFetch) {
            return 'fetch';
          } else if (capability.mozchunkedarraybuffer) {
            return 'moz-chunked-arraybuffer';
          } else if (capability.msstream) {
            return 'ms-stream';
          } else if (capability.arraybuffer && preferBinary) {
            return 'arraybuffer';
          } else if (capability.vbArray && preferBinary) {
            return 'text:vbarray';
          } else {
            return 'text';
          }
        }

        var ClientRequest = module.exports = function (opts) {
          var self = this;
          stream.Writable.call(self);

          self._opts = opts;
          self._body = [];
          self._headers = {};
          if (opts.auth) self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
          Object.keys(opts.headers).forEach(function (name) {
            self.setHeader(name, opts.headers[name]);
          });

          var preferBinary;
          var useFetch = true;
          if (opts.mode === 'disable-fetch' || 'requestTimeout' in opts && !capability.abortController) {
            // If the use of XHR should be preferred. Not typically needed.
            useFetch = false;
            preferBinary = true;
          } else if (opts.mode === 'prefer-streaming') {
            // If streaming is a high priority but binary compatibility and
            // the accuracy of the 'content-type' header aren't
            preferBinary = false;
          } else if (opts.mode === 'allow-wrong-content-type') {
            // If streaming is more important than preserving the 'content-type' header
            preferBinary = !capability.overrideMimeType;
          } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
            // Use binary if text streaming may corrupt data or the content-type header, or for speed
            preferBinary = true;
          } else {
            throw new Error('Invalid value for opts.mode');
          }
          self._mode = decideMode(preferBinary, useFetch);
          self._fetchTimer = null;

          self.on('finish', function () {
            self._onFinish();
          });
        };

        inherits(ClientRequest, stream.Writable);

        ClientRequest.prototype.setHeader = function (name, value) {
          var self = this;
          var lowerName = name.toLowerCase();
          // This check is not necessary, but it prevents warnings from browsers about setting unsafe
          // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
          // http-browserify did it, so I will too.
          if (unsafeHeaders.indexOf(lowerName) !== -1) return;

          self._headers[lowerName] = {
            name: name,
            value: value
          };
        };

        ClientRequest.prototype.getHeader = function (name) {
          var header = this._headers[name.toLowerCase()];
          if (header) return header.value;
          return null;
        };

        ClientRequest.prototype.removeHeader = function (name) {
          var self = this;
          delete self._headers[name.toLowerCase()];
        };

        ClientRequest.prototype._onFinish = function () {
          var self = this;

          if (self._destroyed) return;
          var opts = self._opts;

          var headersObj = self._headers;
          var body = null;
          if (opts.method !== 'GET' && opts.method !== 'HEAD') {
            if (capability.arraybuffer) {
              body = toArrayBuffer(Buffer.concat(self._body));
            } else if (capability.blobConstructor) {
              body = new global.Blob(self._body.map(function (buffer) {
                return toArrayBuffer(buffer);
              }), {
                type: (headersObj['content-type'] || {}).value || ''
              });
            } else {
              // get utf8 string
              body = Buffer.concat(self._body).toString();
            }
          }

          // create flattened list of headers
          var headersList = [];
          Object.keys(headersObj).forEach(function (keyName) {
            var name = headersObj[keyName].name;
            var value = headersObj[keyName].value;
            if (Array.isArray(value)) {
              value.forEach(function (v) {
                headersList.push([name, v]);
              });
            } else {
              headersList.push([name, value]);
            }
          });

          if (self._mode === 'fetch') {
            var signal = null;
            var fetchTimer = null;
            if (capability.abortController) {
              var controller = new AbortController();
              signal = controller.signal;
              self._fetchAbortController = controller;

              if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
                self._fetchTimer = global.setTimeout(function () {
                  self.emit('requestTimeout');
                  if (self._fetchAbortController) self._fetchAbortController.abort();
                }, opts.requestTimeout);
              }
            }

            global.fetch(self._opts.url, {
              method: self._opts.method,
              headers: headersList,
              body: body || undefined,
              mode: 'cors',
              credentials: opts.withCredentials ? 'include' : 'same-origin',
              signal: signal
            }).then(function (response) {
              self._fetchResponse = response;
              self._connect();
            }, function (reason) {
              global.clearTimeout(self._fetchTimer);
              if (!self._destroyed) self.emit('error', reason);
            });
          } else {
            var xhr = self._xhr = new global.XMLHttpRequest();
            try {
              xhr.open(self._opts.method, self._opts.url, true);
            } catch (err) {
              process.nextTick(function () {
                self.emit('error', err);
              });
              return;
            }

            // Can't set responseType on really old browsers
            if ('responseType' in xhr) xhr.responseType = self._mode.split(':')[0];

            if ('withCredentials' in xhr) xhr.withCredentials = !!opts.withCredentials;

            if (self._mode === 'text' && 'overrideMimeType' in xhr) xhr.overrideMimeType('text/plain; charset=x-user-defined');

            if ('requestTimeout' in opts) {
              xhr.timeout = opts.requestTimeout;
              xhr.ontimeout = function () {
                self.emit('requestTimeout');
              };
            }

            headersList.forEach(function (header) {
              xhr.setRequestHeader(header[0], header[1]);
            });

            self._response = null;
            xhr.onreadystatechange = function () {
              switch (xhr.readyState) {
                case rStates.LOADING:
                case rStates.DONE:
                  self._onXHRProgress();
                  break;
              }
            };
            // Necessary for streaming in Firefox, since xhr.response is ONLY defined
            // in onprogress, not in onreadystatechange with xhr.readyState = 3
            if (self._mode === 'moz-chunked-arraybuffer') {
              xhr.onprogress = function () {
                self._onXHRProgress();
              };
            }

            xhr.onerror = function () {
              if (self._destroyed) return;
              self.emit('error', new Error('XHR error'));
            };

            try {
              xhr.send(body);
            } catch (err) {
              process.nextTick(function () {
                self.emit('error', err);
              });
              return;
            }
          }
        };

        /**
         * Checks if xhr.status is readable and non-zero, indicating no error.
         * Even though the spec says it should be available in readyState 3,
         * accessing it throws an exception in IE8
         */
        function statusValid(xhr) {
          try {
            var status = xhr.status;
            return status !== null && status !== 0;
          } catch (e) {
            return false;
          }
        }

        ClientRequest.prototype._onXHRProgress = function () {
          var self = this;

          if (!statusValid(self._xhr) || self._destroyed) return;

          if (!self._response) self._connect();

          self._response._onXHRProgress();
        };

        ClientRequest.prototype._connect = function () {
          var self = this;

          if (self._destroyed) return;

          self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._fetchTimer);
          self._response.on('error', function (err) {
            self.emit('error', err);
          });

          self.emit('response', self._response);
        };

        ClientRequest.prototype._write = function (chunk, encoding, cb) {
          var self = this;

          self._body.push(chunk);
          cb();
        };

        ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
          var self = this;
          self._destroyed = true;
          global.clearTimeout(self._fetchTimer);
          if (self._response) self._response._destroyed = true;
          if (self._xhr) self._xhr.abort();else if (self._fetchAbortController) self._fetchAbortController.abort();
        };

        ClientRequest.prototype.end = function (data, encoding, cb) {
          var self = this;
          if (typeof data === 'function') {
            cb = data;
            data = undefined;
          }

          stream.Writable.prototype.end.call(self, data, encoding, cb);
        };

        ClientRequest.prototype.flushHeaders = function () {};
        ClientRequest.prototype.setTimeout = function () {};
        ClientRequest.prototype.setNoDelay = function () {};
        ClientRequest.prototype.setSocketKeepAlive = function () {};

        // Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
        var unsafeHeaders = ['accept-charset', 'accept-encoding', 'access-control-request-headers', 'access-control-request-method', 'connection', 'content-length', 'cookie', 'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin', 'referer', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'via'];
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer);
    }, { "./capability": 47, "./response": 49, "_process": 27, "buffer": 6, "inherits": 18, "readable-stream": 44, "to-arraybuffer": 52 }], 49: [function (require, module, exports) {
      (function (process, global, Buffer) {
        var capability = require('./capability');
        var inherits = require('inherits');
        var stream = require('readable-stream');

        var rStates = exports.readyStates = {
          UNSENT: 0,
          OPENED: 1,
          HEADERS_RECEIVED: 2,
          LOADING: 3,
          DONE: 4
        };

        var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, fetchTimer) {
          var self = this;
          stream.Readable.call(self);

          self._mode = mode;
          self.headers = {};
          self.rawHeaders = [];
          self.trailers = {};
          self.rawTrailers = [];

          // Fake the 'close' event, but only once 'end' fires
          self.on('end', function () {
            // The nextTick is necessary to prevent the 'request' module from causing an infinite loop
            process.nextTick(function () {
              self.emit('close');
            });
          });

          if (mode === 'fetch') {
            var read = function read() {
              reader.read().then(function (result) {
                if (self._destroyed) return;
                if (result.done) {
                  global.clearTimeout(fetchTimer);
                  self.push(null);
                  return;
                }
                self.push(new Buffer(result.value));
                read();
              }).catch(function (err) {
                global.clearTimeout(fetchTimer);
                if (!self._destroyed) self.emit('error', err);
              });
            };

            self._fetchResponse = response;

            self.url = response.url;
            self.statusCode = response.status;
            self.statusMessage = response.statusText;

            response.headers.forEach(function (header, key) {
              self.headers[key.toLowerCase()] = header;
              self.rawHeaders.push(key, header);
            });

            if (capability.writableStream) {
              var writable = new WritableStream({
                write: function write(chunk) {
                  return new Promise(function (resolve, reject) {
                    if (self._destroyed) {
                      reject();
                    } else if (self.push(new Buffer(chunk))) {
                      resolve();
                    } else {
                      self._resumeFetch = resolve;
                    }
                  });
                },
                close: function close() {
                  global.clearTimeout(fetchTimer);
                  if (!self._destroyed) self.push(null);
                },
                abort: function abort(err) {
                  if (!self._destroyed) self.emit('error', err);
                }
              });

              try {
                response.body.pipeTo(writable).catch(function (err) {
                  global.clearTimeout(fetchTimer);
                  if (!self._destroyed) self.emit('error', err);
                });
                return;
              } catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
            }
            // fallback for when writableStream or pipeTo aren't available
            var reader = response.body.getReader();

            read();
          } else {
            self._xhr = xhr;
            self._pos = 0;

            self.url = xhr.responseURL;
            self.statusCode = xhr.status;
            self.statusMessage = xhr.statusText;
            var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
            headers.forEach(function (header) {
              var matches = header.match(/^([^:]+):\s*(.*)/);
              if (matches) {
                var key = matches[1].toLowerCase();
                if (key === 'set-cookie') {
                  if (self.headers[key] === undefined) {
                    self.headers[key] = [];
                  }
                  self.headers[key].push(matches[2]);
                } else if (self.headers[key] !== undefined) {
                  self.headers[key] += ', ' + matches[2];
                } else {
                  self.headers[key] = matches[2];
                }
                self.rawHeaders.push(matches[1], matches[2]);
              }
            });

            self._charset = 'x-user-defined';
            if (!capability.overrideMimeType) {
              var mimeType = self.rawHeaders['mime-type'];
              if (mimeType) {
                var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
                if (charsetMatch) {
                  self._charset = charsetMatch[1].toLowerCase();
                }
              }
              if (!self._charset) self._charset = 'utf-8'; // best guess
            }
          }
        };

        inherits(IncomingMessage, stream.Readable);

        IncomingMessage.prototype._read = function () {
          var self = this;

          var resolve = self._resumeFetch;
          if (resolve) {
            self._resumeFetch = null;
            resolve();
          }
        };

        IncomingMessage.prototype._onXHRProgress = function () {
          var self = this;

          var xhr = self._xhr;

          var response = null;
          switch (self._mode) {
            case 'text:vbarray':
              // For IE9
              if (xhr.readyState !== rStates.DONE) break;
              try {
                // This fails in IE8
                response = new global.VBArray(xhr.responseBody).toArray();
              } catch (e) {}
              if (response !== null) {
                self.push(new Buffer(response));
                break;
              }
            // Falls through in IE8	
            case 'text':
              try {
                // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
                response = xhr.responseText;
              } catch (e) {
                self._mode = 'text:vbarray';
                break;
              }
              if (response.length > self._pos) {
                var newData = response.substr(self._pos);
                if (self._charset === 'x-user-defined') {
                  var buffer = new Buffer(newData.length);
                  for (var i = 0; i < newData.length; i++) {
                    buffer[i] = newData.charCodeAt(i) & 0xff;
                  }self.push(buffer);
                } else {
                  self.push(newData, self._charset);
                }
                self._pos = response.length;
              }
              break;
            case 'arraybuffer':
              if (xhr.readyState !== rStates.DONE || !xhr.response) break;
              response = xhr.response;
              self.push(new Buffer(new Uint8Array(response)));
              break;
            case 'moz-chunked-arraybuffer':
              // take whole
              response = xhr.response;
              if (xhr.readyState !== rStates.LOADING || !response) break;
              self.push(new Buffer(new Uint8Array(response)));
              break;
            case 'ms-stream':
              response = xhr.response;
              if (xhr.readyState !== rStates.LOADING) break;
              var reader = new global.MSStreamReader();
              reader.onprogress = function () {
                if (reader.result.byteLength > self._pos) {
                  self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
                  self._pos = reader.result.byteLength;
                }
              };
              reader.onload = function () {
                self.push(null);
              };
              // reader.onerror = ??? // TODO: this
              reader.readAsArrayBuffer(response);
              break;
          }

          // The ms-stream case handles end separately in reader.onload()
          if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
            self.push(null);
          }
        };
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer);
    }, { "./capability": 47, "_process": 27, "buffer": 6, "inherits": 18, "readable-stream": 44 }], 50: [function (require, module, exports) {
      var isHexPrefixed = require('is-hex-prefixed');

      /**
       * Removes '0x' from a given `String` is present
       * @param {String} str the string value
       * @return {String|Optional} a string by pass if necessary
       */
      module.exports = function stripHexPrefix(str) {
        if (typeof str !== 'string') {
          return str;
        }

        return isHexPrefixed(str) ? str.slice(2) : str;
      };
    }, { "is-hex-prefixed": 20 }], 51: [function (require, module, exports) {
      (function (setImmediate, clearImmediate) {
        var nextTick = require('process/browser.js').nextTick;
        var apply = Function.prototype.apply;
        var slice = Array.prototype.slice;
        var immediateIds = {};
        var nextImmediateId = 0;

        // DOM APIs, for completeness

        exports.setTimeout = function () {
          return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
        };
        exports.setInterval = function () {
          return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
        };
        exports.clearTimeout = exports.clearInterval = function (timeout) {
          timeout.close();
        };

        function Timeout(id, clearFn) {
          this._id = id;
          this._clearFn = clearFn;
        }
        Timeout.prototype.unref = Timeout.prototype.ref = function () {};
        Timeout.prototype.close = function () {
          this._clearFn.call(window, this._id);
        };

        // Does not start the time, just sets up the members needed.
        exports.enroll = function (item, msecs) {
          clearTimeout(item._idleTimeoutId);
          item._idleTimeout = msecs;
        };

        exports.unenroll = function (item) {
          clearTimeout(item._idleTimeoutId);
          item._idleTimeout = -1;
        };

        exports._unrefActive = exports.active = function (item) {
          clearTimeout(item._idleTimeoutId);

          var msecs = item._idleTimeout;
          if (msecs >= 0) {
            item._idleTimeoutId = setTimeout(function onTimeout() {
              if (item._onTimeout) item._onTimeout();
            }, msecs);
          }
        };

        // That's not how node.js implements it but the exposed api is the same.
        exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function (fn) {
          var id = nextImmediateId++;
          var args = arguments.length < 2 ? false : slice.call(arguments, 1);

          immediateIds[id] = true;

          nextTick(function onNextTick() {
            if (immediateIds[id]) {
              // fn.call() is faster so we optimize for the common use-case
              // @see http://jsperf.com/call-apply-segu
              if (args) {
                fn.apply(null, args);
              } else {
                fn.call(null);
              }
              // Prevent ids from leaking
              exports.clearImmediate(id);
            }
          });

          return id;
        };

        exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function (id) {
          delete immediateIds[id];
        };
      }).call(this, require("timers").setImmediate, require("timers").clearImmediate);
    }, { "process/browser.js": 27, "timers": 51 }], 52: [function (require, module, exports) {
      var Buffer = require('buffer').Buffer;

      module.exports = function (buf) {
        // If the buffer is backed by a Uint8Array, a faster version will work
        if (buf instanceof Uint8Array) {
          // If the buffer isn't a subarray, return the underlying ArrayBuffer
          if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
            return buf.buffer;
          } else if (typeof buf.buffer.slice === 'function') {
            // Otherwise we need to get a proper copy
            return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
          }
        }

        if (Buffer.isBuffer(buf)) {
          // This is the slow version that will work with any Buffer
          // implementation (even in old browsers)
          var arrayCopy = new Uint8Array(buf.length);
          var len = buf.length;
          for (var i = 0; i < len; i++) {
            arrayCopy[i] = buf[i];
          }
          return arrayCopy.buffer;
        } else {
          throw new Error('Argument must be a Buffer');
        }
      };
    }, { "buffer": 6 }], 53: [function (require, module, exports) {
      (function (global) {
        //     Underscore.js 1.9.1
        //     http://underscorejs.org
        //     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
        //     Underscore may be freely distributed under the MIT license.

        (function () {

          // Baseline setup
          // --------------

          // Establish the root object, `window` (`self`) in the browser, `global`
          // on the server, or `this` in some virtual machines. We use `self`
          // instead of `window` for `WebWorker` support.
          var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global.global === global && global || this || {};

          // Save the previous value of the `_` variable.
          var previousUnderscore = root._;

          // Save bytes in the minified (but not gzipped) version:
          var ArrayProto = Array.prototype,
              ObjProto = Object.prototype;
          var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

          // Create quick reference variables for speed access to core prototypes.
          var push = ArrayProto.push,
              slice = ArrayProto.slice,
              toString = ObjProto.toString,
              hasOwnProperty = ObjProto.hasOwnProperty;

          // All **ECMAScript 5** native function implementations that we hope to use
          // are declared here.
          var nativeIsArray = Array.isArray,
              nativeKeys = Object.keys,
              nativeCreate = Object.create;

          // Naked function reference for surrogate-prototype-swapping.
          var Ctor = function Ctor() {};

          // Create a safe reference to the Underscore object for use below.
          var _ = function _(obj) {
            if (obj instanceof _) return obj;
            if (!(this instanceof _)) return new _(obj);
            this._wrapped = obj;
          };

          // Export the Underscore object for **Node.js**, with
          // backwards-compatibility for their old module API. If we're in
          // the browser, add `_` as a global object.
          // (`nodeType` is checked to ensure that `module`
          // and `exports` are not HTML elements.)
          if (typeof exports != 'undefined' && !exports.nodeType) {
            if (typeof module != 'undefined' && !module.nodeType && module.exports) {
              exports = module.exports = _;
            }
            exports._ = _;
          } else {
            root._ = _;
          }

          // Current version.
          _.VERSION = '1.9.1';

          // Internal function that returns an efficient (for current engines) version
          // of the passed-in callback, to be repeatedly applied in other Underscore
          // functions.
          var optimizeCb = function optimizeCb(func, context, argCount) {
            if (context === void 0) return func;
            switch (argCount == null ? 3 : argCount) {
              case 1:
                return function (value) {
                  return func.call(context, value);
                };
              // The 2-argument case is omitted because we’re not using it.
              case 3:
                return function (value, index, collection) {
                  return func.call(context, value, index, collection);
                };
              case 4:
                return function (accumulator, value, index, collection) {
                  return func.call(context, accumulator, value, index, collection);
                };
            }
            return function () {
              return func.apply(context, arguments);
            };
          };

          var builtinIteratee;

          // An internal function to generate callbacks that can be applied to each
          // element in a collection, returning the desired result — either `identity`,
          // an arbitrary callback, a property matcher, or a property accessor.
          var cb = function cb(value, context, argCount) {
            if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
            if (value == null) return _.identity;
            if (_.isFunction(value)) return optimizeCb(value, context, argCount);
            if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
            return _.property(value);
          };

          // External wrapper for our callback generator. Users may customize
          // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
          // This abstraction hides the internal-only argCount argument.
          _.iteratee = builtinIteratee = function builtinIteratee(value, context) {
            return cb(value, context, Infinity);
          };

          // Some functions take a variable number of arguments, or a few expected
          // arguments at the beginning and then a variable number of values to operate
          // on. This helper accumulates all remaining arguments past the function’s
          // argument length (or an explicit `startIndex`), into an array that becomes
          // the last argument. Similar to ES6’s "rest parameter".
          var restArguments = function restArguments(func, startIndex) {
            startIndex = startIndex == null ? func.length - 1 : +startIndex;
            return function () {
              var length = Math.max(arguments.length - startIndex, 0),
                  rest = Array(length),
                  index = 0;
              for (; index < length; index++) {
                rest[index] = arguments[index + startIndex];
              }
              switch (startIndex) {
                case 0:
                  return func.call(this, rest);
                case 1:
                  return func.call(this, arguments[0], rest);
                case 2:
                  return func.call(this, arguments[0], arguments[1], rest);
              }
              var args = Array(startIndex + 1);
              for (index = 0; index < startIndex; index++) {
                args[index] = arguments[index];
              }
              args[startIndex] = rest;
              return func.apply(this, args);
            };
          };

          // An internal function for creating a new object that inherits from another.
          var baseCreate = function baseCreate(prototype) {
            if (!_.isObject(prototype)) return {};
            if (nativeCreate) return nativeCreate(prototype);
            Ctor.prototype = prototype;
            var result = new Ctor();
            Ctor.prototype = null;
            return result;
          };

          var shallowProperty = function shallowProperty(key) {
            return function (obj) {
              return obj == null ? void 0 : obj[key];
            };
          };

          var has = function has(obj, path) {
            return obj != null && hasOwnProperty.call(obj, path);
          };

          var deepGet = function deepGet(obj, path) {
            var length = path.length;
            for (var i = 0; i < length; i++) {
              if (obj == null) return void 0;
              obj = obj[path[i]];
            }
            return length ? obj : void 0;
          };

          // Helper for collection methods to determine whether a collection
          // should be iterated as an array or as an object.
          // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
          // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
          var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
          var getLength = shallowProperty('length');
          var isArrayLike = function isArrayLike(collection) {
            var length = getLength(collection);
            return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
          };

          // Collection Functions
          // --------------------

          // The cornerstone, an `each` implementation, aka `forEach`.
          // Handles raw objects in addition to array-likes. Treats all
          // sparse array-likes as if they were dense.
          _.each = _.forEach = function (obj, iteratee, context) {
            iteratee = optimizeCb(iteratee, context);
            var i, length;
            if (isArrayLike(obj)) {
              for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
              }
            } else {
              var keys = _.keys(obj);
              for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
              }
            }
            return obj;
          };

          // Return the results of applying the iteratee to each element.
          _.map = _.collect = function (obj, iteratee, context) {
            iteratee = cb(iteratee, context);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                results = Array(length);
            for (var index = 0; index < length; index++) {
              var currentKey = keys ? keys[index] : index;
              results[index] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
          };

          // Create a reducing function iterating left or right.
          var createReduce = function createReduce(dir) {
            // Wrap code that reassigns argument variables in a separate function than
            // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
            var reducer = function reducer(obj, iteratee, memo, initial) {
              var keys = !isArrayLike(obj) && _.keys(obj),
                  length = (keys || obj).length,
                  index = dir > 0 ? 0 : length - 1;
              if (!initial) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
              }
              for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
              }
              return memo;
            };

            return function (obj, iteratee, memo, context) {
              var initial = arguments.length >= 3;
              return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
            };
          };

          // **Reduce** builds up a single result from a list of values, aka `inject`,
          // or `foldl`.
          _.reduce = _.foldl = _.inject = createReduce(1);

          // The right-associative version of reduce, also known as `foldr`.
          _.reduceRight = _.foldr = createReduce(-1);

          // Return the first value which passes a truth test. Aliased as `detect`.
          _.find = _.detect = function (obj, predicate, context) {
            var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
            var key = keyFinder(obj, predicate, context);
            if (key !== void 0 && key !== -1) return obj[key];
          };

          // Return all the elements that pass a truth test.
          // Aliased as `select`.
          _.filter = _.select = function (obj, predicate, context) {
            var results = [];
            predicate = cb(predicate, context);
            _.each(obj, function (value, index, list) {
              if (predicate(value, index, list)) results.push(value);
            });
            return results;
          };

          // Return all the elements for which a truth test fails.
          _.reject = function (obj, predicate, context) {
            return _.filter(obj, _.negate(cb(predicate)), context);
          };

          // Determine whether all of the elements match a truth test.
          // Aliased as `all`.
          _.every = _.all = function (obj, predicate, context) {
            predicate = cb(predicate, context);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length;
            for (var index = 0; index < length; index++) {
              var currentKey = keys ? keys[index] : index;
              if (!predicate(obj[currentKey], currentKey, obj)) return false;
            }
            return true;
          };

          // Determine if at least one element in the object matches a truth test.
          // Aliased as `any`.
          _.some = _.any = function (obj, predicate, context) {
            predicate = cb(predicate, context);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length;
            for (var index = 0; index < length; index++) {
              var currentKey = keys ? keys[index] : index;
              if (predicate(obj[currentKey], currentKey, obj)) return true;
            }
            return false;
          };

          // Determine if the array or object contains a given item (using `===`).
          // Aliased as `includes` and `include`.
          _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            if (typeof fromIndex != 'number' || guard) fromIndex = 0;
            return _.indexOf(obj, item, fromIndex) >= 0;
          };

          // Invoke a method (with arguments) on every item in a collection.
          _.invoke = restArguments(function (obj, path, args) {
            var contextPath, func;
            if (_.isFunction(path)) {
              func = path;
            } else if (_.isArray(path)) {
              contextPath = path.slice(0, -1);
              path = path[path.length - 1];
            }
            return _.map(obj, function (context) {
              var method = func;
              if (!method) {
                if (contextPath && contextPath.length) {
                  context = deepGet(context, contextPath);
                }
                if (context == null) return void 0;
                method = context[path];
              }
              return method == null ? method : method.apply(context, args);
            });
          });

          // Convenience version of a common use case of `map`: fetching a property.
          _.pluck = function (obj, key) {
            return _.map(obj, _.property(key));
          };

          // Convenience version of a common use case of `filter`: selecting only objects
          // containing specific `key:value` pairs.
          _.where = function (obj, attrs) {
            return _.filter(obj, _.matcher(attrs));
          };

          // Convenience version of a common use case of `find`: getting the first object
          // containing specific `key:value` pairs.
          _.findWhere = function (obj, attrs) {
            return _.find(obj, _.matcher(attrs));
          };

          // Return the maximum element (or element-based computation).
          _.max = function (obj, iteratee, context) {
            var result = -Infinity,
                lastComputed = -Infinity,
                value,
                computed;
            if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
              obj = isArrayLike(obj) ? obj : _.values(obj);
              for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value > result) {
                  result = value;
                }
              }
            } else {
              iteratee = cb(iteratee, context);
              _.each(obj, function (v, index, list) {
                computed = iteratee(v, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                  result = v;
                  lastComputed = computed;
                }
              });
            }
            return result;
          };

          // Return the minimum element (or element-based computation).
          _.min = function (obj, iteratee, context) {
            var result = Infinity,
                lastComputed = Infinity,
                value,
                computed;
            if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
              obj = isArrayLike(obj) ? obj : _.values(obj);
              for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value < result) {
                  result = value;
                }
              }
            } else {
              iteratee = cb(iteratee, context);
              _.each(obj, function (v, index, list) {
                computed = iteratee(v, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                  result = v;
                  lastComputed = computed;
                }
              });
            }
            return result;
          };

          // Shuffle a collection.
          _.shuffle = function (obj) {
            return _.sample(obj, Infinity);
          };

          // Sample **n** random values from a collection using the modern version of the
          // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
          // If **n** is not specified, returns a single random element.
          // The internal `guard` argument allows it to work with `map`.
          _.sample = function (obj, n, guard) {
            if (n == null || guard) {
              if (!isArrayLike(obj)) obj = _.values(obj);
              return obj[_.random(obj.length - 1)];
            }
            var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
            var length = getLength(sample);
            n = Math.max(Math.min(n, length), 0);
            var last = length - 1;
            for (var index = 0; index < n; index++) {
              var rand = _.random(index, last);
              var temp = sample[index];
              sample[index] = sample[rand];
              sample[rand] = temp;
            }
            return sample.slice(0, n);
          };

          // Sort the object's values by a criterion produced by an iteratee.
          _.sortBy = function (obj, iteratee, context) {
            var index = 0;
            iteratee = cb(iteratee, context);
            return _.pluck(_.map(obj, function (value, key, list) {
              return {
                value: value,
                index: index++,
                criteria: iteratee(value, key, list)
              };
            }).sort(function (left, right) {
              var a = left.criteria;
              var b = right.criteria;
              if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
              }
              return left.index - right.index;
            }), 'value');
          };

          // An internal function used for aggregate "group by" operations.
          var group = function group(behavior, partition) {
            return function (obj, iteratee, context) {
              var result = partition ? [[], []] : {};
              iteratee = cb(iteratee, context);
              _.each(obj, function (value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
              });
              return result;
            };
          };

          // Groups the object's values by a criterion. Pass either a string attribute
          // to group by, or a function that returns the criterion.
          _.groupBy = group(function (result, value, key) {
            if (has(result, key)) result[key].push(value);else result[key] = [value];
          });

          // Indexes the object's values by a criterion, similar to `groupBy`, but for
          // when you know that your index values will be unique.
          _.indexBy = group(function (result, value, key) {
            result[key] = value;
          });

          // Counts instances of an object that group by a certain criterion. Pass
          // either a string attribute to count by, or a function that returns the
          // criterion.
          _.countBy = group(function (result, value, key) {
            if (has(result, key)) result[key]++;else result[key] = 1;
          });

          var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
          // Safely create a real, live array from anything iterable.
          _.toArray = function (obj) {
            if (!obj) return [];
            if (_.isArray(obj)) return slice.call(obj);
            if (_.isString(obj)) {
              // Keep surrogate pair characters together
              return obj.match(reStrSymbol);
            }
            if (isArrayLike(obj)) return _.map(obj, _.identity);
            return _.values(obj);
          };

          // Return the number of elements in an object.
          _.size = function (obj) {
            if (obj == null) return 0;
            return isArrayLike(obj) ? obj.length : _.keys(obj).length;
          };

          // Split a collection into two arrays: one whose elements all satisfy the given
          // predicate, and one whose elements all do not satisfy the predicate.
          _.partition = group(function (result, value, pass) {
            result[pass ? 0 : 1].push(value);
          }, true);

          // Array Functions
          // ---------------

          // Get the first element of an array. Passing **n** will return the first N
          // values in the array. Aliased as `head` and `take`. The **guard** check
          // allows it to work with `_.map`.
          _.first = _.head = _.take = function (array, n, guard) {
            if (array == null || array.length < 1) return n == null ? void 0 : [];
            if (n == null || guard) return array[0];
            return _.initial(array, array.length - n);
          };

          // Returns everything but the last entry of the array. Especially useful on
          // the arguments object. Passing **n** will return all the values in
          // the array, excluding the last N.
          _.initial = function (array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
          };

          // Get the last element of an array. Passing **n** will return the last N
          // values in the array.
          _.last = function (array, n, guard) {
            if (array == null || array.length < 1) return n == null ? void 0 : [];
            if (n == null || guard) return array[array.length - 1];
            return _.rest(array, Math.max(0, array.length - n));
          };

          // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
          // Especially useful on the arguments object. Passing an **n** will return
          // the rest N values in the array.
          _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
          };

          // Trim out all falsy values from an array.
          _.compact = function (array) {
            return _.filter(array, Boolean);
          };

          // Internal implementation of a recursive `flatten` function.
          var flatten = function flatten(input, shallow, strict, output) {
            output = output || [];
            var idx = output.length;
            for (var i = 0, length = getLength(input); i < length; i++) {
              var value = input[i];
              if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                // Flatten current level of array or arguments object.
                if (shallow) {
                  var j = 0,
                      len = value.length;
                  while (j < len) {
                    output[idx++] = value[j++];
                  }
                } else {
                  flatten(value, shallow, strict, output);
                  idx = output.length;
                }
              } else if (!strict) {
                output[idx++] = value;
              }
            }
            return output;
          };

          // Flatten out an array, either recursively (by default), or just one level.
          _.flatten = function (array, shallow) {
            return flatten(array, shallow, false);
          };

          // Return a version of the array that does not contain the specified value(s).
          _.without = restArguments(function (array, otherArrays) {
            return _.difference(array, otherArrays);
          });

          // Produce a duplicate-free version of the array. If the array has already
          // been sorted, you have the option of using a faster algorithm.
          // The faster algorithm will not work with an iteratee if the iteratee
          // is not a one-to-one function, so providing an iteratee will disable
          // the faster algorithm.
          // Aliased as `unique`.
          _.uniq = _.unique = function (array, isSorted, iteratee, context) {
            if (!_.isBoolean(isSorted)) {
              context = iteratee;
              iteratee = isSorted;
              isSorted = false;
            }
            if (iteratee != null) iteratee = cb(iteratee, context);
            var result = [];
            var seen = [];
            for (var i = 0, length = getLength(array); i < length; i++) {
              var value = array[i],
                  computed = iteratee ? iteratee(value, i, array) : value;
              if (isSorted && !iteratee) {
                if (!i || seen !== computed) result.push(value);
                seen = computed;
              } else if (iteratee) {
                if (!_.contains(seen, computed)) {
                  seen.push(computed);
                  result.push(value);
                }
              } else if (!_.contains(result, value)) {
                result.push(value);
              }
            }
            return result;
          };

          // Produce an array that contains the union: each distinct element from all of
          // the passed-in arrays.
          _.union = restArguments(function (arrays) {
            return _.uniq(flatten(arrays, true, true));
          });

          // Produce an array that contains every item shared between all the
          // passed-in arrays.
          _.intersection = function (array) {
            var result = [];
            var argsLength = arguments.length;
            for (var i = 0, length = getLength(array); i < length; i++) {
              var item = array[i];
              if (_.contains(result, item)) continue;
              var j;
              for (j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
              }
              if (j === argsLength) result.push(item);
            }
            return result;
          };

          // Take the difference between one array and a number of other arrays.
          // Only the elements present in just the first array will remain.
          _.difference = restArguments(function (array, rest) {
            rest = flatten(rest, true, true);
            return _.filter(array, function (value) {
              return !_.contains(rest, value);
            });
          });

          // Complement of _.zip. Unzip accepts an array of arrays and groups
          // each array's elements on shared indices.
          _.unzip = function (array) {
            var length = array && _.max(array, getLength).length || 0;
            var result = Array(length);

            for (var index = 0; index < length; index++) {
              result[index] = _.pluck(array, index);
            }
            return result;
          };

          // Zip together multiple lists into a single array -- elements that share
          // an index go together.
          _.zip = restArguments(_.unzip);

          // Converts lists into objects. Pass either a single array of `[key, value]`
          // pairs, or two parallel arrays of the same length -- one of keys, and one of
          // the corresponding values. Passing by pairs is the reverse of _.pairs.
          _.object = function (list, values) {
            var result = {};
            for (var i = 0, length = getLength(list); i < length; i++) {
              if (values) {
                result[list[i]] = values[i];
              } else {
                result[list[i][0]] = list[i][1];
              }
            }
            return result;
          };

          // Generator function to create the findIndex and findLastIndex functions.
          var createPredicateIndexFinder = function createPredicateIndexFinder(dir) {
            return function (array, predicate, context) {
              predicate = cb(predicate, context);
              var length = getLength(array);
              var index = dir > 0 ? 0 : length - 1;
              for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array)) return index;
              }
              return -1;
            };
          };

          // Returns the first index on an array-like that passes a predicate test.
          _.findIndex = createPredicateIndexFinder(1);
          _.findLastIndex = createPredicateIndexFinder(-1);

          // Use a comparator function to figure out the smallest index at which
          // an object should be inserted so as to maintain order. Uses binary search.
          _.sortedIndex = function (array, obj, iteratee, context) {
            iteratee = cb(iteratee, context, 1);
            var value = iteratee(obj);
            var low = 0,
                high = getLength(array);
            while (low < high) {
              var mid = Math.floor((low + high) / 2);
              if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
            }
            return low;
          };

          // Generator function to create the indexOf and lastIndexOf functions.
          var createIndexFinder = function createIndexFinder(dir, predicateFind, sortedIndex) {
            return function (array, item, idx) {
              var i = 0,
                  length = getLength(array);
              if (typeof idx == 'number') {
                if (dir > 0) {
                  i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                  length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
              } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
              }
              if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
              }
              for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
              }
              return -1;
            };
          };

          // Return the position of the first occurrence of an item in an array,
          // or -1 if the item is not included in the array.
          // If the array is large and already in sort order, pass `true`
          // for **isSorted** to use binary search.
          _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
          _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

          // Generate an integer Array containing an arithmetic progression. A port of
          // the native Python `range()` function. See
          // [the Python documentation](http://docs.python.org/library/functions.html#range).
          _.range = function (start, stop, step) {
            if (stop == null) {
              stop = start || 0;
              start = 0;
            }
            if (!step) {
              step = stop < start ? -1 : 1;
            }

            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);

            for (var idx = 0; idx < length; idx++, start += step) {
              range[idx] = start;
            }

            return range;
          };

          // Chunk a single array into multiple arrays, each containing `count` or fewer
          // items.
          _.chunk = function (array, count) {
            if (count == null || count < 1) return [];
            var result = [];
            var i = 0,
                length = array.length;
            while (i < length) {
              result.push(slice.call(array, i, i += count));
            }
            return result;
          };

          // Function (ahem) Functions
          // ------------------

          // Determines whether to execute a function as a constructor
          // or a normal function with the provided arguments.
          var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
            if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
            var self = baseCreate(sourceFunc.prototype);
            var result = sourceFunc.apply(self, args);
            if (_.isObject(result)) return result;
            return self;
          };

          // Create a function bound to a given object (assigning `this`, and arguments,
          // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
          // available.
          _.bind = restArguments(function (func, context, args) {
            if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
            var bound = restArguments(function (callArgs) {
              return executeBound(func, bound, context, this, args.concat(callArgs));
            });
            return bound;
          });

          // Partially apply a function by creating a version that has had some of its
          // arguments pre-filled, without changing its dynamic `this` context. _ acts
          // as a placeholder by default, allowing any combination of arguments to be
          // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
          _.partial = restArguments(function (func, boundArgs) {
            var placeholder = _.partial.placeholder;
            var bound = function bound() {
              var position = 0,
                  length = boundArgs.length;
              var args = Array(length);
              for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
              }
              while (position < arguments.length) {
                args.push(arguments[position++]);
              }return executeBound(func, bound, this, this, args);
            };
            return bound;
          });

          _.partial.placeholder = _;

          // Bind a number of an object's methods to that object. Remaining arguments
          // are the method names to be bound. Useful for ensuring that all callbacks
          // defined on an object belong to it.
          _.bindAll = restArguments(function (obj, keys) {
            keys = flatten(keys, false, false);
            var index = keys.length;
            if (index < 1) throw new Error('bindAll must be passed function names');
            while (index--) {
              var key = keys[index];
              obj[key] = _.bind(obj[key], obj);
            }
          });

          // Memoize an expensive function by storing its results.
          _.memoize = function (func, hasher) {
            var memoize = function memoize(key) {
              var cache = memoize.cache;
              var address = '' + (hasher ? hasher.apply(this, arguments) : key);
              if (!has(cache, address)) cache[address] = func.apply(this, arguments);
              return cache[address];
            };
            memoize.cache = {};
            return memoize;
          };

          // Delays a function for the given number of milliseconds, and then calls
          // it with the arguments supplied.
          _.delay = restArguments(function (func, wait, args) {
            return setTimeout(function () {
              return func.apply(null, args);
            }, wait);
          });

          // Defers a function, scheduling it to run after the current call stack has
          // cleared.
          _.defer = _.partial(_.delay, _, 1);

          // Returns a function, that, when invoked, will only be triggered at most once
          // during a given window of time. Normally, the throttled function will run
          // as much as it can, without ever going more than once per `wait` duration;
          // but if you'd like to disable the execution on the leading edge, pass
          // `{leading: false}`. To disable execution on the trailing edge, ditto.
          _.throttle = function (func, wait, options) {
            var timeout, context, args, result;
            var previous = 0;
            if (!options) options = {};

            var later = function later() {
              previous = options.leading === false ? 0 : _.now();
              timeout = null;
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            };

            var throttled = function throttled() {
              var now = _.now();
              if (!previous && options.leading === false) previous = now;
              var remaining = wait - (now - previous);
              context = this;
              args = arguments;
              if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
              } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
              }
              return result;
            };

            throttled.cancel = function () {
              clearTimeout(timeout);
              previous = 0;
              timeout = context = args = null;
            };

            return throttled;
          };

          // Returns a function, that, as long as it continues to be invoked, will not
          // be triggered. The function will be called after it stops being called for
          // N milliseconds. If `immediate` is passed, trigger the function on the
          // leading edge, instead of the trailing.
          _.debounce = function (func, wait, immediate) {
            var timeout, result;

            var later = function later(context, args) {
              timeout = null;
              if (args) result = func.apply(context, args);
            };

            var debounced = restArguments(function (args) {
              if (timeout) clearTimeout(timeout);
              if (immediate) {
                var callNow = !timeout;
                timeout = setTimeout(later, wait);
                if (callNow) result = func.apply(this, args);
              } else {
                timeout = _.delay(later, wait, this, args);
              }

              return result;
            });

            debounced.cancel = function () {
              clearTimeout(timeout);
              timeout = null;
            };

            return debounced;
          };

          // Returns the first function passed as an argument to the second,
          // allowing you to adjust arguments, run code before and after, and
          // conditionally execute the original function.
          _.wrap = function (func, wrapper) {
            return _.partial(wrapper, func);
          };

          // Returns a negated version of the passed-in predicate.
          _.negate = function (predicate) {
            return function () {
              return !predicate.apply(this, arguments);
            };
          };

          // Returns a function that is the composition of a list of functions, each
          // consuming the return value of the function that follows.
          _.compose = function () {
            var args = arguments;
            var start = args.length - 1;
            return function () {
              var i = start;
              var result = args[start].apply(this, arguments);
              while (i--) {
                result = args[i].call(this, result);
              }return result;
            };
          };

          // Returns a function that will only be executed on and after the Nth call.
          _.after = function (times, func) {
            return function () {
              if (--times < 1) {
                return func.apply(this, arguments);
              }
            };
          };

          // Returns a function that will only be executed up to (but not including) the Nth call.
          _.before = function (times, func) {
            var memo;
            return function () {
              if (--times > 0) {
                memo = func.apply(this, arguments);
              }
              if (times <= 1) func = null;
              return memo;
            };
          };

          // Returns a function that will be executed at most one time, no matter how
          // often you call it. Useful for lazy initialization.
          _.once = _.partial(_.before, 2);

          _.restArguments = restArguments;

          // Object Functions
          // ----------------

          // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
          var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
          var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

          var collectNonEnumProps = function collectNonEnumProps(obj, keys) {
            var nonEnumIdx = nonEnumerableProps.length;
            var constructor = obj.constructor;
            var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

            // Constructor is a special case.
            var prop = 'constructor';
            if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

            while (nonEnumIdx--) {
              prop = nonEnumerableProps[nonEnumIdx];
              if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
              }
            }
          };

          // Retrieve the names of an object's own properties.
          // Delegates to **ECMAScript 5**'s native `Object.keys`.
          _.keys = function (obj) {
            if (!_.isObject(obj)) return [];
            if (nativeKeys) return nativeKeys(obj);
            var keys = [];
            for (var key in obj) {
              if (has(obj, key)) keys.push(key);
            } // Ahem, IE < 9.
            if (hasEnumBug) collectNonEnumProps(obj, keys);
            return keys;
          };

          // Retrieve all the property names of an object.
          _.allKeys = function (obj) {
            if (!_.isObject(obj)) return [];
            var keys = [];
            for (var key in obj) {
              keys.push(key);
            } // Ahem, IE < 9.
            if (hasEnumBug) collectNonEnumProps(obj, keys);
            return keys;
          };

          // Retrieve the values of an object's properties.
          _.values = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var values = Array(length);
            for (var i = 0; i < length; i++) {
              values[i] = obj[keys[i]];
            }
            return values;
          };

          // Returns the results of applying the iteratee to each element of the object.
          // In contrast to _.map it returns an object.
          _.mapObject = function (obj, iteratee, context) {
            iteratee = cb(iteratee, context);
            var keys = _.keys(obj),
                length = keys.length,
                results = {};
            for (var index = 0; index < length; index++) {
              var currentKey = keys[index];
              results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
          };

          // Convert an object into a list of `[key, value]` pairs.
          // The opposite of _.object.
          _.pairs = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var pairs = Array(length);
            for (var i = 0; i < length; i++) {
              pairs[i] = [keys[i], obj[keys[i]]];
            }
            return pairs;
          };

          // Invert the keys and values of an object. The values must be serializable.
          _.invert = function (obj) {
            var result = {};
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
              result[obj[keys[i]]] = keys[i];
            }
            return result;
          };

          // Return a sorted list of the function names available on the object.
          // Aliased as `methods`.
          _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
              if (_.isFunction(obj[key])) names.push(key);
            }
            return names.sort();
          };

          // An internal function for creating assigner functions.
          var createAssigner = function createAssigner(keysFunc, defaults) {
            return function (obj) {
              var length = arguments.length;
              if (defaults) obj = Object(obj);
              if (length < 2 || obj == null) return obj;
              for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                  var key = keys[i];
                  if (!defaults || obj[key] === void 0) obj[key] = source[key];
                }
              }
              return obj;
            };
          };

          // Extend a given object with all the properties in passed-in object(s).
          _.extend = createAssigner(_.allKeys);

          // Assigns a given object with all the own properties in the passed-in object(s).
          // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
          _.extendOwn = _.assign = createAssigner(_.keys);

          // Returns the first key on an object that passes a predicate test.
          _.findKey = function (obj, predicate, context) {
            predicate = cb(predicate, context);
            var keys = _.keys(obj),
                key;
            for (var i = 0, length = keys.length; i < length; i++) {
              key = keys[i];
              if (predicate(obj[key], key, obj)) return key;
            }
          };

          // Internal pick helper function to determine if `obj` has key `key`.
          var keyInObj = function keyInObj(value, key, obj) {
            return key in obj;
          };

          // Return a copy of the object only containing the whitelisted properties.
          _.pick = restArguments(function (obj, keys) {
            var result = {},
                iteratee = keys[0];
            if (obj == null) return result;
            if (_.isFunction(iteratee)) {
              if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
              keys = _.allKeys(obj);
            } else {
              iteratee = keyInObj;
              keys = flatten(keys, false, false);
              obj = Object(obj);
            }
            for (var i = 0, length = keys.length; i < length; i++) {
              var key = keys[i];
              var value = obj[key];
              if (iteratee(value, key, obj)) result[key] = value;
            }
            return result;
          });

          // Return a copy of the object without the blacklisted properties.
          _.omit = restArguments(function (obj, keys) {
            var iteratee = keys[0],
                context;
            if (_.isFunction(iteratee)) {
              iteratee = _.negate(iteratee);
              if (keys.length > 1) context = keys[1];
            } else {
              keys = _.map(flatten(keys, false, false), String);
              iteratee = function iteratee(value, key) {
                return !_.contains(keys, key);
              };
            }
            return _.pick(obj, iteratee, context);
          });

          // Fill in a given object with default properties.
          _.defaults = createAssigner(_.allKeys, true);

          // Creates an object that inherits from the given prototype object.
          // If additional properties are provided then they will be added to the
          // created object.
          _.create = function (prototype, props) {
            var result = baseCreate(prototype);
            if (props) _.extendOwn(result, props);
            return result;
          };

          // Create a (shallow-cloned) duplicate of an object.
          _.clone = function (obj) {
            if (!_.isObject(obj)) return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
          };

          // Invokes interceptor with the obj, and then returns obj.
          // The primary purpose of this method is to "tap into" a method chain, in
          // order to perform operations on intermediate results within the chain.
          _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
          };

          // Returns whether an object has a given set of `key:value` pairs.
          _.isMatch = function (object, attrs) {
            var keys = _.keys(attrs),
                length = keys.length;
            if (object == null) return !length;
            var obj = Object(object);
            for (var i = 0; i < length; i++) {
              var key = keys[i];
              if (attrs[key] !== obj[key] || !(key in obj)) return false;
            }
            return true;
          };

          // Internal recursive comparison function for `isEqual`.
          var eq, deepEq;
          eq = function eq(a, b, aStack, bStack) {
            // Identical objects are equal. `0 === -0`, but they aren't identical.
            // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
            if (a === b) return a !== 0 || 1 / a === 1 / b;
            // `null` or `undefined` only equal to itself (strict comparison).
            if (a == null || b == null) return false;
            // `NaN`s are equivalent, but non-reflexive.
            if (a !== a) return b !== b;
            // Exhaust primitive checks
            var type = typeof a === "undefined" ? "undefined" : _typeof(a);
            if (type !== 'function' && type !== 'object' && (typeof b === "undefined" ? "undefined" : _typeof(b)) != 'object') return false;
            return deepEq(a, b, aStack, bStack);
          };

          // Internal recursive comparison function for `isEqual`.
          deepEq = function deepEq(a, b, aStack, bStack) {
            // Unwrap any wrapped objects.
            if (a instanceof _) a = a._wrapped;
            if (b instanceof _) b = b._wrapped;
            // Compare `[[Class]]` names.
            var className = toString.call(a);
            if (className !== toString.call(b)) return false;
            switch (className) {
              // Strings, numbers, regular expressions, dates, and booleans are compared by value.
              case '[object RegExp]':
              // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
              case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
              case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
              case '[object Date]':
              case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
              case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
            }

            var areArrays = className === '[object Array]';
            if (!areArrays) {
              if ((typeof a === "undefined" ? "undefined" : _typeof(a)) != 'object' || (typeof b === "undefined" ? "undefined" : _typeof(b)) != 'object') return false;

              // Objects with different constructors are not equivalent, but `Object`s or `Array`s
              // from different frames are.
              var aCtor = a.constructor,
                  bCtor = b.constructor;
              if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
                return false;
              }
            }
            // Assume equality for cyclic structures. The algorithm for detecting cyclic
            // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

            // Initializing stack of traversed objects.
            // It's done here since we only need them for objects and arrays comparison.
            aStack = aStack || [];
            bStack = bStack || [];
            var length = aStack.length;
            while (length--) {
              // Linear search. Performance is inversely proportional to the number of
              // unique nested structures.
              if (aStack[length] === a) return bStack[length] === b;
            }

            // Add the first object to the stack of traversed objects.
            aStack.push(a);
            bStack.push(b);

            // Recursively compare objects and arrays.
            if (areArrays) {
              // Compare array lengths to determine if a deep comparison is necessary.
              length = a.length;
              if (length !== b.length) return false;
              // Deep compare the contents, ignoring non-numeric properties.
              while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
              }
            } else {
              // Deep compare objects.
              var keys = _.keys(a),
                  key;
              length = keys.length;
              // Ensure that both objects contain the same number of properties before comparing deep equality.
              if (_.keys(b).length !== length) return false;
              while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
              }
            }
            // Remove the first object from the stack of traversed objects.
            aStack.pop();
            bStack.pop();
            return true;
          };

          // Perform a deep comparison to check if two objects are equal.
          _.isEqual = function (a, b) {
            return eq(a, b);
          };

          // Is a given array, string, or object empty?
          // An "empty" object has no enumerable own-properties.
          _.isEmpty = function (obj) {
            if (obj == null) return true;
            if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
            return _.keys(obj).length === 0;
          };

          // Is a given value a DOM element?
          _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
          };

          // Is a given value an array?
          // Delegates to ECMA5's native Array.isArray
          _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) === '[object Array]';
          };

          // Is a given variable an object?
          _.isObject = function (obj) {
            var type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
            return type === 'function' || type === 'object' && !!obj;
          };

          // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
          _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
            _['is' + name] = function (obj) {
              return toString.call(obj) === '[object ' + name + ']';
            };
          });

          // Define a fallback version of the method in browsers (ahem, IE < 9), where
          // there isn't any inspectable "Arguments" type.
          if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
              return has(obj, 'callee');
            };
          }

          // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
          // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
          var nodelist = root.document && root.document.childNodes;
          if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object' && typeof nodelist != 'function') {
            _.isFunction = function (obj) {
              return typeof obj == 'function' || false;
            };
          }

          // Is a given object a finite number?
          _.isFinite = function (obj) {
            return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
          };

          // Is the given value `NaN`?
          _.isNaN = function (obj) {
            return _.isNumber(obj) && isNaN(obj);
          };

          // Is a given value a boolean?
          _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
          };

          // Is a given value equal to null?
          _.isNull = function (obj) {
            return obj === null;
          };

          // Is a given variable undefined?
          _.isUndefined = function (obj) {
            return obj === void 0;
          };

          // Shortcut function for checking if an object has a given property directly
          // on itself (in other words, not on a prototype).
          _.has = function (obj, path) {
            if (!_.isArray(path)) {
              return has(obj, path);
            }
            var length = path.length;
            for (var i = 0; i < length; i++) {
              var key = path[i];
              if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
              }
              obj = obj[key];
            }
            return !!length;
          };

          // Utility Functions
          // -----------------

          // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
          // previous owner. Returns a reference to the Underscore object.
          _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
          };

          // Keep the identity function around for default iteratees.
          _.identity = function (value) {
            return value;
          };

          // Predicate-generating functions. Often useful outside of Underscore.
          _.constant = function (value) {
            return function () {
              return value;
            };
          };

          _.noop = function () {};

          // Creates a function that, when passed an object, will traverse that object’s
          // properties down the given `path`, specified as an array of keys or indexes.
          _.property = function (path) {
            if (!_.isArray(path)) {
              return shallowProperty(path);
            }
            return function (obj) {
              return deepGet(obj, path);
            };
          };

          // Generates a function for a given object that returns a given property.
          _.propertyOf = function (obj) {
            if (obj == null) {
              return function () {};
            }
            return function (path) {
              return !_.isArray(path) ? obj[path] : deepGet(obj, path);
            };
          };

          // Returns a predicate for checking whether an object has a given set of
          // `key:value` pairs.
          _.matcher = _.matches = function (attrs) {
            attrs = _.extendOwn({}, attrs);
            return function (obj) {
              return _.isMatch(obj, attrs);
            };
          };

          // Run a function **n** times.
          _.times = function (n, iteratee, context) {
            var accum = Array(Math.max(0, n));
            iteratee = optimizeCb(iteratee, context, 1);
            for (var i = 0; i < n; i++) {
              accum[i] = iteratee(i);
            }return accum;
          };

          // Return a random integer between min and max (inclusive).
          _.random = function (min, max) {
            if (max == null) {
              max = min;
              min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
          };

          // A (possibly faster) way to get the current timestamp as an integer.
          _.now = Date.now || function () {
            return new Date().getTime();
          };

          // List of HTML entities for escaping.
          var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
          };
          var unescapeMap = _.invert(escapeMap);

          // Functions for escaping and unescaping strings to/from HTML interpolation.
          var createEscaper = function createEscaper(map) {
            var escaper = function escaper(match) {
              return map[match];
            };
            // Regexes for identifying a key that needs to be escaped.
            var source = '(?:' + _.keys(map).join('|') + ')';
            var testRegexp = RegExp(source);
            var replaceRegexp = RegExp(source, 'g');
            return function (string) {
              string = string == null ? '' : '' + string;
              return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
          };
          _.escape = createEscaper(escapeMap);
          _.unescape = createEscaper(unescapeMap);

          // Traverses the children of `obj` along `path`. If a child is a function, it
          // is invoked with its parent as context. Returns the value of the final
          // child, or `fallback` if any child is undefined.
          _.result = function (obj, path, fallback) {
            if (!_.isArray(path)) path = [path];
            var length = path.length;
            if (!length) {
              return _.isFunction(fallback) ? fallback.call(obj) : fallback;
            }
            for (var i = 0; i < length; i++) {
              var prop = obj == null ? void 0 : obj[path[i]];
              if (prop === void 0) {
                prop = fallback;
                i = length; // Ensure we don't continue iterating.
              }
              obj = _.isFunction(prop) ? prop.call(obj) : prop;
            }
            return obj;
          };

          // Generate a unique integer id (unique within the entire client session).
          // Useful for temporary DOM ids.
          var idCounter = 0;
          _.uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
          };

          // By default, Underscore uses ERB-style template delimiters, change the
          // following template settings to use alternative delimiters.
          _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
          };

          // When customizing `templateSettings`, if you don't want to define an
          // interpolation, evaluation or escaping regex, we need one that is
          // guaranteed not to match.
          var noMatch = /(.)^/;

          // Certain characters need to be escaped so that they can be put into a
          // string literal.
          var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            "\u2028": 'u2028',
            "\u2029": 'u2029'
          };

          var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

          var escapeChar = function escapeChar(match) {
            return '\\' + escapes[match];
          };

          // JavaScript micro-templating, similar to John Resig's implementation.
          // Underscore templating handles arbitrary delimiters, preserves whitespace,
          // and correctly escapes quotes within interpolated code.
          // NB: `oldSettings` only exists for backwards compatibility.
          _.template = function (text, settings, oldSettings) {
            if (!settings && oldSettings) settings = oldSettings;
            settings = _.defaults({}, settings, _.templateSettings);

            // Combine delimiters into one regular expression via alternation.
            var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

            // Compile the template source, escaping string literals appropriately.
            var index = 0;
            var source = "__p+='";
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
              source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
              index = offset + match.length;

              if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
              } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
              } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
              }

              // Adobe VMs need the match returned to produce the correct offset.
              return match;
            });
            source += "';\n";

            // If a variable is not specified, place data values in local scope.
            if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

            source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

            var render;
            try {
              render = new Function(settings.variable || 'obj', '_', source);
            } catch (e) {
              e.source = source;
              throw e;
            }

            var template = function template(data) {
              return render.call(this, data, _);
            };

            // Provide the compiled source as a convenience for precompilation.
            var argument = settings.variable || 'obj';
            template.source = 'function(' + argument + '){\n' + source + '}';

            return template;
          };

          // Add a "chain" function. Start chaining a wrapped Underscore object.
          _.chain = function (obj) {
            var instance = _(obj);
            instance._chain = true;
            return instance;
          };

          // OOP
          // ---------------
          // If Underscore is called as a function, it returns a wrapped object that
          // can be used OO-style. This wrapper holds altered versions of all the
          // underscore functions. Wrapped objects may be chained.

          // Helper function to continue chaining intermediate results.
          var chainResult = function chainResult(instance, obj) {
            return instance._chain ? _(obj).chain() : obj;
          };

          // Add your own custom functions to the Underscore object.
          _.mixin = function (obj) {
            _.each(_.functions(obj), function (name) {
              var func = _[name] = obj[name];
              _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return chainResult(this, func.apply(_, args));
              };
            });
            return _;
          };

          // Add all of the Underscore functions to the wrapper object.
          _.mixin(_);

          // Add all mutator Array functions to the wrapper.
          _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
              var obj = this._wrapped;
              method.apply(obj, arguments);
              if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
              return chainResult(this, obj);
            };
          });

          // Add all accessor Array functions to the wrapper.
          _.each(['concat', 'join', 'slice'], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
              return chainResult(this, method.apply(this._wrapped, arguments));
            };
          });

          // Extracts the result from a wrapped and chained object.
          _.prototype.value = function () {
            return this._wrapped;
          };

          // Provide unwrapping proxy for some methods used in engine operations
          // such as arithmetic and JSON stringification.
          _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

          _.prototype.toString = function () {
            return String(this._wrapped);
          };

          // AMD registration happens at the end for compatibility with AMD loaders
          // that may not enforce next-turn semantics on modules. Even though general
          // practice for AMD registration is to be anonymous, underscore registers
          // as a named module because, like jQuery, it is a base library that is
          // popular enough to be bundled in a third party lib, but not be part of
          // an AMD load request. Those cases could generate an error when an
          // anonymous define() is called outside of a loader request.
          if (typeof define == 'function' && define.amd) {
            define('underscore', [], function () {
              return _;
            });
          }
        })();
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 54: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      'use strict';

      var punycode = require('punycode');
      var util = require('./util');

      exports.parse = urlParse;
      exports.resolve = urlResolve;
      exports.resolveObject = urlResolveObject;
      exports.format = urlFormat;

      exports.Url = Url;

      function Url() {
        this.protocol = null;
        this.slashes = null;
        this.auth = null;
        this.host = null;
        this.port = null;
        this.hostname = null;
        this.hash = null;
        this.search = null;
        this.query = null;
        this.pathname = null;
        this.path = null;
        this.href = null;
      }

      // Reference: RFC 3986, RFC 1808, RFC 2396

      // define these here so at least they only have to be
      // compiled once on the first module load.
      var protocolPattern = /^([a-z0-9.+-]+:)/i,
          portPattern = /:[0-9]*$/,


      // Special case for a simple path URL
      simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,


      // RFC 2396: characters reserved for delimiting URLs.
      // We actually just auto-escape these.
      delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],


      // RFC 2396: characters not allowed for various reasons.
      unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),


      // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
      autoEscape = ['\''].concat(unwise),

      // Characters that are never ever allowed in a hostname.
      // Note that any invalid chars are also handled, but these
      // are the ones that are *expected* to be seen, so we fast-path
      // them.
      nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
          hostEndingChars = ['/', '?', '#'],
          hostnameMaxLen = 255,
          hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
          hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,

      // protocols that can allow "unsafe" and "unwise" chars.
      unsafeProtocol = {
        'javascript': true,
        'javascript:': true
      },

      // protocols that never have a hostname.
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },

      // protocols that always contain a // bit.
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
          querystring = require('querystring');

      function urlParse(url, parseQueryString, slashesDenoteHost) {
        if (url && util.isObject(url) && url instanceof Url) return url;

        var u = new Url();
        u.parse(url, parseQueryString, slashesDenoteHost);
        return u;
      }

      Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
        if (!util.isString(url)) {
          throw new TypeError("Parameter 'url' must be a string, not " + (typeof url === "undefined" ? "undefined" : _typeof(url)));
        }

        // Copy chrome, IE, opera backslash-handling behavior.
        // Back slashes before the query string get converted to forward slashes
        // See: https://code.google.com/p/chromium/issues/detail?id=25916
        var queryIndex = url.indexOf('?'),
            splitter = queryIndex !== -1 && queryIndex < url.indexOf('#') ? '?' : '#',
            uSplit = url.split(splitter),
            slashRegex = /\\/g;
        uSplit[0] = uSplit[0].replace(slashRegex, '/');
        url = uSplit.join(splitter);

        var rest = url;

        // trim before proceeding.
        // This is to support parse stuff like "  http://foo.com  \n"
        rest = rest.trim();

        if (!slashesDenoteHost && url.split('#').length === 1) {
          // Try fast path regexp
          var simplePath = simplePathPattern.exec(rest);
          if (simplePath) {
            this.path = rest;
            this.href = rest;
            this.pathname = simplePath[1];
            if (simplePath[2]) {
              this.search = simplePath[2];
              if (parseQueryString) {
                this.query = querystring.parse(this.search.substr(1));
              } else {
                this.query = this.search.substr(1);
              }
            } else if (parseQueryString) {
              this.search = '';
              this.query = {};
            }
            return this;
          }
        }

        var proto = protocolPattern.exec(rest);
        if (proto) {
          proto = proto[0];
          var lowerProto = proto.toLowerCase();
          this.protocol = lowerProto;
          rest = rest.substr(proto.length);
        }

        // figure out if it's got a host
        // user@server is *always* interpreted as a hostname, and url
        // resolution will treat //foo/bar as host=foo,path=bar because that's
        // how the browser resolves relative URLs.
        if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
          var slashes = rest.substr(0, 2) === '//';
          if (slashes && !(proto && hostlessProtocol[proto])) {
            rest = rest.substr(2);
            this.slashes = true;
          }
        }

        if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {

          // there's a hostname.
          // the first instance of /, ?, ;, or # ends the host.
          //
          // If there is an @ in the hostname, then non-host chars *are* allowed
          // to the left of the last @ sign, unless some host-ending character
          // comes *before* the @-sign.
          // URLs are obnoxious.
          //
          // ex:
          // http://a@b@c/ => user:a@b host:c
          // http://a@b?@c => user:a host:c path:/?@c

          // v0.12 TODO(isaacs): This is not quite how Chrome does things.
          // Review our test case against browsers more comprehensively.

          // find the first instance of any hostEndingChars
          var hostEnd = -1;
          for (var i = 0; i < hostEndingChars.length; i++) {
            var hec = rest.indexOf(hostEndingChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
          }

          // at this point, either we have an explicit point where the
          // auth portion cannot go past, or the last @ char is the decider.
          var auth, atSign;
          if (hostEnd === -1) {
            // atSign can be anywhere.
            atSign = rest.lastIndexOf('@');
          } else {
            // atSign must be in auth portion.
            // http://a@b/c@d => host:b auth:a path:/c@d
            atSign = rest.lastIndexOf('@', hostEnd);
          }

          // Now we have a portion which is definitely the auth.
          // Pull that off.
          if (atSign !== -1) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
          }

          // the host is the remaining to the left of the first non-host char
          hostEnd = -1;
          for (var i = 0; i < nonHostChars.length; i++) {
            var hec = rest.indexOf(nonHostChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
          }
          // if we still have not hit it, then the entire thing is a host.
          if (hostEnd === -1) hostEnd = rest.length;

          this.host = rest.slice(0, hostEnd);
          rest = rest.slice(hostEnd);

          // pull out port.
          this.parseHost();

          // we've indicated that there is a hostname,
          // so even if it's empty, it has to be present.
          this.hostname = this.hostname || '';

          // if hostname begins with [ and ends with ]
          // assume that it's an IPv6 address.
          var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

          // validate a little.
          if (!ipv6Hostname) {
            var hostparts = this.hostname.split(/\./);
            for (var i = 0, l = hostparts.length; i < l; i++) {
              var part = hostparts[i];
              if (!part) continue;
              if (!part.match(hostnamePartPattern)) {
                var newpart = '';
                for (var j = 0, k = part.length; j < k; j++) {
                  if (part.charCodeAt(j) > 127) {
                    // we replace non-ASCII char with a temporary placeholder
                    // we need this to make sure size of hostname is not
                    // broken by replacing non-ASCII by nothing
                    newpart += 'x';
                  } else {
                    newpart += part[j];
                  }
                }
                // we test again with ASCII char only
                if (!newpart.match(hostnamePartPattern)) {
                  var validParts = hostparts.slice(0, i);
                  var notHost = hostparts.slice(i + 1);
                  var bit = part.match(hostnamePartStart);
                  if (bit) {
                    validParts.push(bit[1]);
                    notHost.unshift(bit[2]);
                  }
                  if (notHost.length) {
                    rest = '/' + notHost.join('.') + rest;
                  }
                  this.hostname = validParts.join('.');
                  break;
                }
              }
            }
          }

          if (this.hostname.length > hostnameMaxLen) {
            this.hostname = '';
          } else {
            // hostnames are always lower case.
            this.hostname = this.hostname.toLowerCase();
          }

          if (!ipv6Hostname) {
            // IDNA Support: Returns a punycoded representation of "domain".
            // It only converts parts of the domain name that
            // have non-ASCII characters, i.e. it doesn't matter if
            // you call it with a domain that already is ASCII-only.
            this.hostname = punycode.toASCII(this.hostname);
          }

          var p = this.port ? ':' + this.port : '';
          var h = this.hostname || '';
          this.host = h + p;
          this.href += this.host;

          // strip [ and ] from the hostname
          // the host field still retains them, though
          if (ipv6Hostname) {
            this.hostname = this.hostname.substr(1, this.hostname.length - 2);
            if (rest[0] !== '/') {
              rest = '/' + rest;
            }
          }
        }

        // now rest is set to the post-host stuff.
        // chop off any delim chars.
        if (!unsafeProtocol[lowerProto]) {

          // First, make 100% sure that any "autoEscape" chars get
          // escaped, even if encodeURIComponent doesn't think they
          // need to be.
          for (var i = 0, l = autoEscape.length; i < l; i++) {
            var ae = autoEscape[i];
            if (rest.indexOf(ae) === -1) continue;
            var esc = encodeURIComponent(ae);
            if (esc === ae) {
              esc = escape(ae);
            }
            rest = rest.split(ae).join(esc);
          }
        }

        // chop off from the tail first.
        var hash = rest.indexOf('#');
        if (hash !== -1) {
          // got a fragment string.
          this.hash = rest.substr(hash);
          rest = rest.slice(0, hash);
        }
        var qm = rest.indexOf('?');
        if (qm !== -1) {
          this.search = rest.substr(qm);
          this.query = rest.substr(qm + 1);
          if (parseQueryString) {
            this.query = querystring.parse(this.query);
          }
          rest = rest.slice(0, qm);
        } else if (parseQueryString) {
          // no query string, but parseQueryString still requested
          this.search = '';
          this.query = {};
        }
        if (rest) this.pathname = rest;
        if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
          this.pathname = '/';
        }

        //to support http.request
        if (this.pathname || this.search) {
          var p = this.pathname || '';
          var s = this.search || '';
          this.path = p + s;
        }

        // finally, reconstruct the href based on what has been validated.
        this.href = this.format();
        return this;
      };

      // format a parsed object into a url string
      function urlFormat(obj) {
        // ensure it's an object, and not a string url.
        // If it's an obj, this is a no-op.
        // this way, you can call url_format() on strings
        // to clean up potentially wonky urls.
        if (util.isString(obj)) obj = urlParse(obj);
        if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
        return obj.format();
      }

      Url.prototype.format = function () {
        var auth = this.auth || '';
        if (auth) {
          auth = encodeURIComponent(auth);
          auth = auth.replace(/%3A/i, ':');
          auth += '@';
        }

        var protocol = this.protocol || '',
            pathname = this.pathname || '',
            hash = this.hash || '',
            host = false,
            query = '';

        if (this.host) {
          host = auth + this.host;
        } else if (this.hostname) {
          host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
          if (this.port) {
            host += ':' + this.port;
          }
        }

        if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
          query = querystring.stringify(this.query);
        }

        var search = this.search || query && '?' + query || '';

        if (protocol && protocol.substr(-1) !== ':') protocol += ':';

        // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
        // unless they had them to begin with.
        if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
          host = '//' + (host || '');
          if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
        } else if (!host) {
          host = '';
        }

        if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
        if (search && search.charAt(0) !== '?') search = '?' + search;

        pathname = pathname.replace(/[?#]/g, function (match) {
          return encodeURIComponent(match);
        });
        search = search.replace('#', '%23');

        return protocol + host + pathname + search + hash;
      };

      function urlResolve(source, relative) {
        return urlParse(source, false, true).resolve(relative);
      }

      Url.prototype.resolve = function (relative) {
        return this.resolveObject(urlParse(relative, false, true)).format();
      };

      function urlResolveObject(source, relative) {
        if (!source) return relative;
        return urlParse(source, false, true).resolveObject(relative);
      }

      Url.prototype.resolveObject = function (relative) {
        if (util.isString(relative)) {
          var rel = new Url();
          rel.parse(relative, false, true);
          relative = rel;
        }

        var result = new Url();
        var tkeys = Object.keys(this);
        for (var tk = 0; tk < tkeys.length; tk++) {
          var tkey = tkeys[tk];
          result[tkey] = this[tkey];
        }

        // hash is always overridden, no matter what.
        // even href="" will remove it.
        result.hash = relative.hash;

        // if the relative url is empty, then there's nothing left to do here.
        if (relative.href === '') {
          result.href = result.format();
          return result;
        }

        // hrefs like //foo/bar always cut to the protocol.
        if (relative.slashes && !relative.protocol) {
          // take everything except the protocol from relative
          var rkeys = Object.keys(relative);
          for (var rk = 0; rk < rkeys.length; rk++) {
            var rkey = rkeys[rk];
            if (rkey !== 'protocol') result[rkey] = relative[rkey];
          }

          //urlParse appends trailing / to urls like http://www.example.com
          if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
            result.path = result.pathname = '/';
          }

          result.href = result.format();
          return result;
        }

        if (relative.protocol && relative.protocol !== result.protocol) {
          // if it's a known url protocol, then changing
          // the protocol does weird things
          // first, if it's not file:, then we MUST have a host,
          // and if there was a path
          // to begin with, then we MUST have a path.
          // if it is file:, then the host is dropped,
          // because that's known to be hostless.
          // anything else is assumed to be absolute.
          if (!slashedProtocol[relative.protocol]) {
            var keys = Object.keys(relative);
            for (var v = 0; v < keys.length; v++) {
              var k = keys[v];
              result[k] = relative[k];
            }
            result.href = result.format();
            return result;
          }

          result.protocol = relative.protocol;
          if (!relative.host && !hostlessProtocol[relative.protocol]) {
            var relPath = (relative.pathname || '').split('/');
            while (relPath.length && !(relative.host = relPath.shift())) {}
            if (!relative.host) relative.host = '';
            if (!relative.hostname) relative.hostname = '';
            if (relPath[0] !== '') relPath.unshift('');
            if (relPath.length < 2) relPath.unshift('');
            result.pathname = relPath.join('/');
          } else {
            result.pathname = relative.pathname;
          }
          result.search = relative.search;
          result.query = relative.query;
          result.host = relative.host || '';
          result.auth = relative.auth;
          result.hostname = relative.hostname || relative.host;
          result.port = relative.port;
          // to support http.request
          if (result.pathname || result.search) {
            var p = result.pathname || '';
            var s = result.search || '';
            result.path = p + s;
          }
          result.slashes = result.slashes || relative.slashes;
          result.href = result.format();
          return result;
        }

        var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
            isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
            mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
            removeAllDots = mustEndAbs,
            srcPath = result.pathname && result.pathname.split('/') || [],
            relPath = relative.pathname && relative.pathname.split('/') || [],
            psychotic = result.protocol && !slashedProtocol[result.protocol];

        // if the url is a non-slashed url, then relative
        // links like ../.. should be able
        // to crawl up to the hostname, as well.  This is strange.
        // result.protocol has already been set by now.
        // Later on, put the first path part into the host field.
        if (psychotic) {
          result.hostname = '';
          result.port = null;
          if (result.host) {
            if (srcPath[0] === '') srcPath[0] = result.host;else srcPath.unshift(result.host);
          }
          result.host = '';
          if (relative.protocol) {
            relative.hostname = null;
            relative.port = null;
            if (relative.host) {
              if (relPath[0] === '') relPath[0] = relative.host;else relPath.unshift(relative.host);
            }
            relative.host = null;
          }
          mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
        }

        if (isRelAbs) {
          // it's absolute.
          result.host = relative.host || relative.host === '' ? relative.host : result.host;
          result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
          result.search = relative.search;
          result.query = relative.query;
          srcPath = relPath;
          // fall through to the dot-handling below.
        } else if (relPath.length) {
          // it's relative
          // throw away the existing file, and take the new path instead.
          if (!srcPath) srcPath = [];
          srcPath.pop();
          srcPath = srcPath.concat(relPath);
          result.search = relative.search;
          result.query = relative.query;
        } else if (!util.isNullOrUndefined(relative.search)) {
          // just pull out the search.
          // like href='?foo'.
          // Put this after the other two cases because it simplifies the booleans
          if (psychotic) {
            result.hostname = result.host = srcPath.shift();
            //occationaly the auth can get stuck only in host
            //this especially happens in cases like
            //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
            var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
            if (authInHost) {
              result.auth = authInHost.shift();
              result.host = result.hostname = authInHost.shift();
            }
          }
          result.search = relative.search;
          result.query = relative.query;
          //to support http.request
          if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
            result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
          }
          result.href = result.format();
          return result;
        }

        if (!srcPath.length) {
          // no path at all.  easy.
          // we've already handled the other stuff above.
          result.pathname = null;
          //to support http.request
          if (result.search) {
            result.path = '/' + result.search;
          } else {
            result.path = null;
          }
          result.href = result.format();
          return result;
        }

        // if a url ENDs in . or .., then it must get a trailing slash.
        // however, if it ends in anything else non-slashy,
        // then it must NOT get a trailing slash.
        var last = srcPath.slice(-1)[0];
        var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

        // strip single dots, resolve double dots to parent dir
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = srcPath.length; i >= 0; i--) {
          last = srcPath[i];
          if (last === '.') {
            srcPath.splice(i, 1);
          } else if (last === '..') {
            srcPath.splice(i, 1);
            up++;
          } else if (up) {
            srcPath.splice(i, 1);
            up--;
          }
        }

        // if the path is allowed to go above the root, restore leading ..s
        if (!mustEndAbs && !removeAllDots) {
          for (; up--; up) {
            srcPath.unshift('..');
          }
        }

        if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
          srcPath.unshift('');
        }

        if (hasTrailingSlash && srcPath.join('/').substr(-1) !== '/') {
          srcPath.push('');
        }

        var isAbsolute = srcPath[0] === '' || srcPath[0] && srcPath[0].charAt(0) === '/';

        // put the host back
        if (psychotic) {
          result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
          //occationaly the auth can get stuck only in host
          //this especially happens in cases like
          //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
          var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
          if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
          }
        }

        mustEndAbs = mustEndAbs || result.host && srcPath.length;

        if (mustEndAbs && !isAbsolute) {
          srcPath.unshift('');
        }

        if (!srcPath.length) {
          result.pathname = null;
          result.path = null;
        } else {
          result.pathname = srcPath.join('/');
        }

        //to support request.http
        if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
          result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
        }
        result.auth = relative.auth || result.auth;
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
      };

      Url.prototype.parseHost = function () {
        var host = this.host;
        var port = portPattern.exec(host);
        if (port) {
          port = port[0];
          if (port !== ':') {
            this.port = port.substr(1);
          }
          host = host.substr(0, host.length - port.length);
        }
        if (host) this.hostname = host;
      };
    }, { "./util": 55, "punycode": 28, "querystring": 31 }], 55: [function (require, module, exports) {
      'use strict';

      module.exports = {
        isString: function isString(arg) {
          return typeof arg === 'string';
        },
        isObject: function isObject(arg) {
          return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
        },
        isNull: function isNull(arg) {
          return arg === null;
        },
        isNullOrUndefined: function isNullOrUndefined(arg) {
          return arg == null;
        }
      };
    }, {}], 56: [function (require, module, exports) {
      /*! https://mths.be/utf8js v3.0.0 by @mathias */
      ;(function (root) {

        var stringFromCharCode = String.fromCharCode;

        // Taken from https://mths.be/punycode
        function ucs2decode(string) {
          var output = [];
          var counter = 0;
          var length = string.length;
          var value;
          var extra;
          while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
              // high surrogate, and there is a next character
              extra = string.charCodeAt(counter++);
              if ((extra & 0xFC00) == 0xDC00) {
                // low surrogate
                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
              } else {
                // unmatched surrogate; only append this code unit, in case the next
                // code unit is the high surrogate of a surrogate pair
                output.push(value);
                counter--;
              }
            } else {
              output.push(value);
            }
          }
          return output;
        }

        // Taken from https://mths.be/punycode
        function ucs2encode(array) {
          var length = array.length;
          var index = -1;
          var value;
          var output = '';
          while (++index < length) {
            value = array[index];
            if (value > 0xFFFF) {
              value -= 0x10000;
              output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
              value = 0xDC00 | value & 0x3FF;
            }
            output += stringFromCharCode(value);
          }
          return output;
        }

        function checkScalarValue(codePoint) {
          if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
            throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
          }
        }
        /*--------------------------------------------------------------------------*/

        function createByte(codePoint, shift) {
          return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
        }

        function encodeCodePoint(codePoint) {
          if ((codePoint & 0xFFFFFF80) == 0) {
            // 1-byte sequence
            return stringFromCharCode(codePoint);
          }
          var symbol = '';
          if ((codePoint & 0xFFFFF800) == 0) {
            // 2-byte sequence
            symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
          } else if ((codePoint & 0xFFFF0000) == 0) {
            // 3-byte sequence
            checkScalarValue(codePoint);
            symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
            symbol += createByte(codePoint, 6);
          } else if ((codePoint & 0xFFE00000) == 0) {
            // 4-byte sequence
            symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
            symbol += createByte(codePoint, 12);
            symbol += createByte(codePoint, 6);
          }
          symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
          return symbol;
        }

        function utf8encode(string) {
          var codePoints = ucs2decode(string);
          var length = codePoints.length;
          var index = -1;
          var codePoint;
          var byteString = '';
          while (++index < length) {
            codePoint = codePoints[index];
            byteString += encodeCodePoint(codePoint);
          }
          return byteString;
        }

        /*--------------------------------------------------------------------------*/

        function readContinuationByte() {
          if (byteIndex >= byteCount) {
            throw Error('Invalid byte index');
          }

          var continuationByte = byteArray[byteIndex] & 0xFF;
          byteIndex++;

          if ((continuationByte & 0xC0) == 0x80) {
            return continuationByte & 0x3F;
          }

          // If we end up here, it’s not a continuation byte
          throw Error('Invalid continuation byte');
        }

        function decodeSymbol() {
          var byte1;
          var byte2;
          var byte3;
          var byte4;
          var codePoint;

          if (byteIndex > byteCount) {
            throw Error('Invalid byte index');
          }

          if (byteIndex == byteCount) {
            return false;
          }

          // Read first byte
          byte1 = byteArray[byteIndex] & 0xFF;
          byteIndex++;

          // 1-byte sequence (no continuation bytes)
          if ((byte1 & 0x80) == 0) {
            return byte1;
          }

          // 2-byte sequence
          if ((byte1 & 0xE0) == 0xC0) {
            byte2 = readContinuationByte();
            codePoint = (byte1 & 0x1F) << 6 | byte2;
            if (codePoint >= 0x80) {
              return codePoint;
            } else {
              throw Error('Invalid continuation byte');
            }
          }

          // 3-byte sequence (may include unpaired surrogates)
          if ((byte1 & 0xF0) == 0xE0) {
            byte2 = readContinuationByte();
            byte3 = readContinuationByte();
            codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;
            if (codePoint >= 0x0800) {
              checkScalarValue(codePoint);
              return codePoint;
            } else {
              throw Error('Invalid continuation byte');
            }
          }

          // 4-byte sequence
          if ((byte1 & 0xF8) == 0xF0) {
            byte2 = readContinuationByte();
            byte3 = readContinuationByte();
            byte4 = readContinuationByte();
            codePoint = (byte1 & 0x07) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;
            if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
              return codePoint;
            }
          }

          throw Error('Invalid UTF-8 detected');
        }

        var byteArray;
        var byteCount;
        var byteIndex;
        function utf8decode(byteString) {
          byteArray = ucs2decode(byteString);
          byteCount = byteArray.length;
          byteIndex = 0;
          var codePoints = [];
          var tmp;
          while ((tmp = decodeSymbol()) !== false) {
            codePoints.push(tmp);
          }
          return ucs2encode(codePoints);
        }

        /*--------------------------------------------------------------------------*/

        root.version = '3.0.0';
        root.encode = utf8encode;
        root.decode = utf8decode;
      })(typeof exports === 'undefined' ? this.utf8 = {} : exports);
    }, {}], 57: [function (require, module, exports) {
      (function (global) {

        /**
         * Module exports.
         */

        module.exports = deprecate;

        /**
         * Mark that a method should not be used.
         * Returns a modified function which warns once by default.
         *
         * If `localStorage.noDeprecation = true` is set, then it is a no-op.
         *
         * If `localStorage.throwDeprecation = true` is set, then deprecated functions
         * will throw an Error when invoked.
         *
         * If `localStorage.traceDeprecation = true` is set, then deprecated functions
         * will invoke `console.trace()` instead of `console.error()`.
         *
         * @param {Function} fn - the function to deprecate
         * @param {String} msg - the string to print to the console when `fn` is invoked
         * @returns {Function} a new "deprecated" version of `fn`
         * @api public
         */

        function deprecate(fn, msg) {
          if (config('noDeprecation')) {
            return fn;
          }

          var warned = false;
          function deprecated() {
            if (!warned) {
              if (config('throwDeprecation')) {
                throw new Error(msg);
              } else if (config('traceDeprecation')) {
                console.trace(msg);
              } else {
                console.warn(msg);
              }
              warned = true;
            }
            return fn.apply(this, arguments);
          }

          return deprecated;
        }

        /**
         * Checks `localStorage` for boolean values for the given `name`.
         *
         * @param {String} name
         * @returns {Boolean}
         * @api private
         */

        function config(name) {
          // accessing global.localStorage can trigger a DOMException in sandboxed iframes
          try {
            if (!global.localStorage) return false;
          } catch (_) {
            return false;
          }
          var val = global.localStorage[name];
          if (null == val) return false;
          return String(val).toLowerCase() === 'true';
        }
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 58: [function (require, module, exports) {
      var _global = function () {
        return this || {};
      }();
      var NativeWebSocket = _global.WebSocket || _global.MozWebSocket;
      var websocket_version = require('./version');

      /**
       * Expose a W3C WebSocket class with just one or two arguments.
       */
      function W3CWebSocket(uri, protocols) {
        var native_instance;

        if (protocols) {
          native_instance = new NativeWebSocket(uri, protocols);
        } else {
          native_instance = new NativeWebSocket(uri);
        }

        /**
         * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
         * class). Since it is an Object it will be returned as it is when creating an
         * instance of W3CWebSocket via 'new W3CWebSocket()'.
         *
         * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
         */
        return native_instance;
      }
      if (NativeWebSocket) {
        ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (prop) {
          Object.defineProperty(W3CWebSocket, prop, {
            get: function get() {
              return NativeWebSocket[prop];
            }
          });
        });
      }

      /**
       * Module exports.
       */
      module.exports = {
        'w3cwebsocket': NativeWebSocket ? W3CWebSocket : null,
        'version': websocket_version
      };
    }, { "./version": 59 }], 59: [function (require, module, exports) {
      module.exports = require('../package.json').version;
    }, { "../package.json": 60 }], 60: [function (require, module, exports) {
      module.exports = {
        "_from": "git://github.com/frozeman/WebSocket-Node.git#browserifyCompatible",
        "_id": "websocket@1.0.26",
        "_inBundle": false,
        "_integrity": "",
        "_location": "/websocket",
        "_phantomChildren": {},
        "_requested": {
          "type": "git",
          "raw": "websocket@git://github.com/frozeman/WebSocket-Node.git#browserifyCompatible",
          "name": "websocket",
          "escapedName": "websocket",
          "rawSpec": "git://github.com/frozeman/WebSocket-Node.git#browserifyCompatible",
          "saveSpec": "git://github.com/frozeman/WebSocket-Node.git#browserifyCompatible",
          "fetchSpec": "git://github.com/frozeman/WebSocket-Node.git",
          "gitCommittish": "browserifyCompatible"
        },
        "_requiredBy": ["/web3-providers-ws"],
        "_resolved": "git://github.com/frozeman/WebSocket-Node.git#6c72925e3f8aaaea8dc8450f97627e85263999f2",
        "_spec": "websocket@git://github.com/frozeman/WebSocket-Node.git#browserifyCompatible",
        "_where": "/Users/etz/Documents/web3.js/node_modules/web3-providers-ws",
        "author": {
          "name": "Brian McKelvey",
          "email": "brian@worlize.com",
          "url": "https://www.worlize.com/"
        },
        "browser": "lib/browser.js",
        "bugs": {
          "url": "https://github.com/theturtle32/WebSocket-Node/issues"
        },
        "bundleDependencies": false,
        "config": {
          "verbose": false
        },
        "contributors": [{
          "name": "Iñaki Baz Castillo",
          "email": "ibc@aliax.net",
          "url": "http://dev.sipdoc.net"
        }],
        "dependencies": {
          "debug": "^2.2.0",
          "nan": "^2.3.3",
          "typedarray-to-buffer": "^3.1.2",
          "yaeti": "^0.0.6"
        },
        "deprecated": false,
        "description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
        "devDependencies": {
          "buffer-equal": "^1.0.0",
          "faucet": "^0.0.1",
          "gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
          "gulp-jshint": "^2.0.4",
          "jshint": "^2.0.0",
          "jshint-stylish": "^2.2.1",
          "tape": "^4.0.1"
        },
        "directories": {
          "lib": "./lib"
        },
        "engines": {
          "node": ">=0.10.0"
        },
        "homepage": "https://github.com/theturtle32/WebSocket-Node",
        "keywords": ["websocket", "websockets", "socket", "networking", "comet", "push", "RFC-6455", "realtime", "server", "client"],
        "license": "Apache-2.0",
        "main": "index",
        "name": "websocket",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/theturtle32/WebSocket-Node.git"
        },
        "scripts": {
          "gulp": "gulp",
          "install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
          "test": "faucet test/unit"
        },
        "version": "1.0.26"
      };
    }, {}], 61: [function (require, module, exports) {
      "use strict";

      var __extends = this && this.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
          d.__proto__ = b;
        } || function (d, b) {
          for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
          }
        };
        return function (d, b) {
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();
      Object.defineProperty(exports, "__esModule", { value: true });
      var SecurityError = /** @class */function (_super) {
        __extends(SecurityError, _super);
        function SecurityError() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return SecurityError;
      }(Error);
      exports.SecurityError = SecurityError;
      var InvalidStateError = /** @class */function (_super) {
        __extends(InvalidStateError, _super);
        function InvalidStateError() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return InvalidStateError;
      }(Error);
      exports.InvalidStateError = InvalidStateError;
      var NetworkError = /** @class */function (_super) {
        __extends(NetworkError, _super);
        function NetworkError() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return NetworkError;
      }(Error);
      exports.NetworkError = NetworkError;
      var SyntaxError = /** @class */function (_super) {
        __extends(SyntaxError, _super);
        function SyntaxError() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return SyntaxError;
      }(Error);
      exports.SyntaxError = SyntaxError;
    }, {}], 62: [function (require, module, exports) {
      "use strict";

      function __export(m) {
        for (var p in m) {
          if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
      }
      Object.defineProperty(exports, "__esModule", { value: true });
      __export(require("./xml-http-request"));
      var xml_http_request_event_target_1 = require("./xml-http-request-event-target");
      exports.XMLHttpRequestEventTarget = xml_http_request_event_target_1.XMLHttpRequestEventTarget;
    }, { "./xml-http-request": 66, "./xml-http-request-event-target": 64 }], 63: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });
      var ProgressEvent = /** @class */function () {
        function ProgressEvent(type) {
          this.type = type;
          this.bubbles = false;
          this.cancelable = false;
          this.loaded = 0;
          this.lengthComputable = false;
          this.total = 0;
        }
        return ProgressEvent;
      }();
      exports.ProgressEvent = ProgressEvent;
    }, {}], 64: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });
      var XMLHttpRequestEventTarget = /** @class */function () {
        function XMLHttpRequestEventTarget() {
          this.listeners = {};
        }
        XMLHttpRequestEventTarget.prototype.addEventListener = function (eventType, listener) {
          eventType = eventType.toLowerCase();
          this.listeners[eventType] = this.listeners[eventType] || [];
          this.listeners[eventType].push(listener.handleEvent || listener);
        };
        XMLHttpRequestEventTarget.prototype.removeEventListener = function (eventType, listener) {
          eventType = eventType.toLowerCase();
          if (!this.listeners[eventType]) {
            return;
          }
          var index = this.listeners[eventType].indexOf(listener.handleEvent || listener);
          if (index < 0) {
            return;
          }
          this.listeners[eventType].splice(index, 1);
        };
        XMLHttpRequestEventTarget.prototype.dispatchEvent = function (event) {
          var eventType = event.type.toLowerCase();
          event.target = this; // TODO: set event.currentTarget?
          if (this.listeners[eventType]) {
            for (var _i = 0, _a = this.listeners[eventType]; _i < _a.length; _i++) {
              var listener_1 = _a[_i];
              listener_1.call(this, event);
            }
          }
          var listener = this["on" + eventType];
          if (listener) {
            listener.call(this, event);
          }
          return true;
        };
        return XMLHttpRequestEventTarget;
      }();
      exports.XMLHttpRequestEventTarget = XMLHttpRequestEventTarget;
    }, {}], 65: [function (require, module, exports) {
      (function (Buffer) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
          } || function (d, b) {
            for (var p in b) {
              if (b.hasOwnProperty(p)) d[p] = b[p];
            }
          };
          return function (d, b) {
            extendStatics(d, b);
            function __() {
              this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();
        Object.defineProperty(exports, "__esModule", { value: true });
        var xml_http_request_event_target_1 = require("./xml-http-request-event-target");
        var XMLHttpRequestUpload = /** @class */function (_super) {
          __extends(XMLHttpRequestUpload, _super);
          function XMLHttpRequestUpload() {
            var _this = _super.call(this) || this;
            _this._contentType = null;
            _this._body = null;
            _this._reset();
            return _this;
          }
          XMLHttpRequestUpload.prototype._reset = function () {
            this._contentType = null;
            this._body = null;
          };
          XMLHttpRequestUpload.prototype._setData = function (data) {
            if (data == null) {
              return;
            }
            if (typeof data === 'string') {
              if (data.length !== 0) {
                this._contentType = 'text/plain;charset=UTF-8';
              }
              this._body = new Buffer(data, 'utf-8');
            } else if (Buffer.isBuffer(data)) {
              this._body = data;
            } else if (data instanceof ArrayBuffer) {
              var body = new Buffer(data.byteLength);
              var view = new Uint8Array(data);
              for (var i = 0; i < data.byteLength; i++) {
                body[i] = view[i];
              }
              this._body = body;
            } else if (data.buffer && data.buffer instanceof ArrayBuffer) {
              var body = new Buffer(data.byteLength);
              var offset = data.byteOffset;
              var view = new Uint8Array(data.buffer);
              for (var i = 0; i < data.byteLength; i++) {
                body[i] = view[i + offset];
              }
              this._body = body;
            } else {
              throw new Error("Unsupported send() data " + data);
            }
          };
          XMLHttpRequestUpload.prototype._finalizeHeaders = function (headers, loweredHeaders) {
            if (this._contentType && !loweredHeaders['content-type']) {
              headers['Content-Type'] = this._contentType;
            }
            if (this._body) {
              headers['Content-Length'] = this._body.length.toString();
            }
          };
          XMLHttpRequestUpload.prototype._startUpload = function (request) {
            if (this._body) {
              request.write(this._body);
            }
            request.end();
          };
          return XMLHttpRequestUpload;
        }(xml_http_request_event_target_1.XMLHttpRequestEventTarget);
        exports.XMLHttpRequestUpload = XMLHttpRequestUpload;
      }).call(this, require("buffer").Buffer);
    }, { "./xml-http-request-event-target": 64, "buffer": 6 }], 66: [function (require, module, exports) {
      (function (process, Buffer) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
          } || function (d, b) {
            for (var p in b) {
              if (b.hasOwnProperty(p)) d[p] = b[p];
            }
          };
          return function (d, b) {
            extendStatics(d, b);
            function __() {
              this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();
        var __assign = this && this.__assign || Object.assign || function (t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) {
              if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
          }
          return t;
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        var http = require("http");
        var https = require("https");
        var os = require("os");
        var url = require("url");
        var progress_event_1 = require("./progress-event");
        var errors_1 = require("./errors");
        var xml_http_request_event_target_1 = require("./xml-http-request-event-target");
        var xml_http_request_upload_1 = require("./xml-http-request-upload");
        var Cookie = require("cookiejar");
        var XMLHttpRequest = /** @class */function (_super) {
          __extends(XMLHttpRequest, _super);
          function XMLHttpRequest(options) {
            if (options === void 0) {
              options = {};
            }
            var _this = _super.call(this) || this;
            _this.UNSENT = XMLHttpRequest.UNSENT;
            _this.OPENED = XMLHttpRequest.OPENED;
            _this.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED;
            _this.LOADING = XMLHttpRequest.LOADING;
            _this.DONE = XMLHttpRequest.DONE;
            _this.onreadystatechange = null;
            _this.readyState = XMLHttpRequest.UNSENT;
            _this.response = null;
            _this.responseText = '';
            _this.responseType = '';
            _this.status = 0; // TODO: UNSENT?
            _this.statusText = '';
            _this.timeout = 0;
            _this.upload = new xml_http_request_upload_1.XMLHttpRequestUpload();
            _this.responseUrl = '';
            _this.withCredentials = false;
            _this._method = null;
            _this._url = null;
            _this._sync = false;
            _this._headers = {};
            _this._loweredHeaders = {};
            _this._mimeOverride = null; // TODO: is type right?
            _this._request = null;
            _this._response = null;
            _this._responseParts = null;
            _this._responseHeaders = null;
            _this._aborting = null; // TODO: type?
            _this._error = null; // TODO: type?
            _this._loadedBytes = 0;
            _this._totalBytes = 0;
            _this._lengthComputable = false;
            _this._restrictedMethods = { CONNECT: true, TRACE: true, TRACK: true };
            _this._restrictedHeaders = {
              'accept-charset': true,
              'accept-encoding': true,
              'access-control-request-headers': true,
              'access-control-request-method': true,
              connection: true,
              'content-length': true,
              cookie: true,
              cookie2: true,
              date: true,
              dnt: true,
              expect: true,
              host: true,
              'keep-alive': true,
              origin: true,
              referer: true,
              te: true,
              trailer: true,
              'transfer-encoding': true,
              upgrade: true,
              'user-agent': true,
              via: true
            };
            _this._privateHeaders = { 'set-cookie': true, 'set-cookie2': true };
            _this._userAgent = "Mozilla/5.0 (" + os.type() + " " + os.arch() + ") node.js/" + process.versions.node + " v8/" + process.versions.v8;
            _this._anonymous = options.anon || false;
            return _this;
          }
          XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            if (async === void 0) {
              async = true;
            }
            method = method.toUpperCase();
            if (this._restrictedMethods[method]) {
              throw new XMLHttpRequest.SecurityError("HTTP method " + method + " is not allowed in XHR");
            }
            ;
            var xhrUrl = this._parseUrl(url, user, password);
            if (this.readyState === XMLHttpRequest.HEADERS_RECEIVED || this.readyState === XMLHttpRequest.LOADING) {
              // TODO(pwnall): terminate abort(), terminate send()
            }
            this._method = method;
            this._url = xhrUrl;
            this._sync = !async;
            this._headers = {};
            this._loweredHeaders = {};
            this._mimeOverride = null;
            this._setReadyState(XMLHttpRequest.OPENED);
            this._request = null;
            this._response = null;
            this.status = 0;
            this.statusText = '';
            this._responseParts = [];
            this._responseHeaders = null;
            this._loadedBytes = 0;
            this._totalBytes = 0;
            this._lengthComputable = false;
          };
          XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
            if (this.readyState !== XMLHttpRequest.OPENED) {
              throw new XMLHttpRequest.InvalidStateError('XHR readyState must be OPENED');
            }
            var loweredName = name.toLowerCase();
            if (this._restrictedHeaders[loweredName] || /^sec-/.test(loweredName) || /^proxy-/.test(loweredName)) {
              console.warn("Refused to set unsafe header \"" + name + "\"");
              return;
            }
            value = value.toString();
            if (this._loweredHeaders[loweredName] != null) {
              name = this._loweredHeaders[loweredName];
              this._headers[name] = this._headers[name] + ", " + value;
            } else {
              this._loweredHeaders[loweredName] = name;
              this._headers[name] = value;
            }
          };
          XMLHttpRequest.prototype.send = function (data) {
            if (this.readyState !== XMLHttpRequest.OPENED) {
              throw new XMLHttpRequest.InvalidStateError('XHR readyState must be OPENED');
            }
            if (this._request) {
              throw new XMLHttpRequest.InvalidStateError('send() already called');
            }
            switch (this._url.protocol) {
              case 'file:':
                return this._sendFile(data);
              case 'http:':
              case 'https:':
                return this._sendHttp(data);
              default:
                throw new XMLHttpRequest.NetworkError("Unsupported protocol " + this._url.protocol);
            }
          };
          XMLHttpRequest.prototype.abort = function () {
            if (this._request == null) {
              return;
            }
            this._request.abort();
            this._setError();
            this._dispatchProgress('abort');
            this._dispatchProgress('loadend');
          };
          XMLHttpRequest.prototype.getResponseHeader = function (name) {
            if (this._responseHeaders == null || name == null) {
              return null;
            }
            var loweredName = name.toLowerCase();
            return this._responseHeaders.hasOwnProperty(loweredName) ? this._responseHeaders[name.toLowerCase()] : null;
          };
          XMLHttpRequest.prototype.getAllResponseHeaders = function () {
            var _this = this;
            if (this._responseHeaders == null) {
              return '';
            }
            return Object.keys(this._responseHeaders).map(function (key) {
              return key + ": " + _this._responseHeaders[key];
            }).join('\r\n');
          };
          XMLHttpRequest.prototype.overrideMimeType = function (mimeType) {
            if (this.readyState === XMLHttpRequest.LOADING || this.readyState === XMLHttpRequest.DONE) {
              throw new XMLHttpRequest.InvalidStateError('overrideMimeType() not allowed in LOADING or DONE');
            }
            this._mimeOverride = mimeType.toLowerCase();
          };
          XMLHttpRequest.prototype.nodejsSet = function (options) {
            this.nodejsHttpAgent = options.httpAgent || this.nodejsHttpAgent;
            this.nodejsHttpsAgent = options.httpsAgent || this.nodejsHttpsAgent;
            if (options.hasOwnProperty('baseUrl')) {
              if (options.baseUrl != null) {
                var parsedUrl = url.parse(options.baseUrl, false, true);
                if (!parsedUrl.protocol) {
                  throw new XMLHttpRequest.SyntaxError("baseUrl must be an absolute URL");
                }
              }
              this.nodejsBaseUrl = options.baseUrl;
            }
          };
          XMLHttpRequest.nodejsSet = function (options) {
            XMLHttpRequest.prototype.nodejsSet(options);
          };
          XMLHttpRequest.prototype._setReadyState = function (readyState) {
            this.readyState = readyState;
            this.dispatchEvent(new progress_event_1.ProgressEvent('readystatechange'));
          };
          XMLHttpRequest.prototype._sendFile = function (data) {
            // TODO
            throw new Error('Protocol file: not implemented');
          };
          XMLHttpRequest.prototype._sendHttp = function (data) {
            if (this._sync) {
              throw new Error('Synchronous XHR processing not implemented');
            }
            if (data && (this._method === 'GET' || this._method === 'HEAD')) {
              console.warn("Discarding entity body for " + this._method + " requests");
              data = null;
            } else {
              data = data || '';
            }
            this.upload._setData(data);
            this._finalizeHeaders();
            this._sendHxxpRequest();
          };
          XMLHttpRequest.prototype._sendHxxpRequest = function () {
            var _this = this;
            if (this.withCredentials) {
              var cookie = XMLHttpRequest.cookieJar.getCookies(Cookie.CookieAccessInfo(this._url.hostname, this._url.pathname, this._url.protocol === 'https:')).toValueString();
              this._headers.cookie = this._headers.cookie2 = cookie;
            }
            var _a = this._url.protocol === 'http:' ? [http, this.nodejsHttpAgent] : [https, this.nodejsHttpsAgent],
                hxxp = _a[0],
                agent = _a[1];
            var requestMethod = hxxp.request.bind(hxxp);
            var request = requestMethod({
              hostname: this._url.hostname,
              port: +this._url.port,
              path: this._url.path,
              auth: this._url.auth,
              method: this._method,
              headers: this._headers,
              agent: agent
            });
            this._request = request;
            if (this.timeout) {
              request.setTimeout(this.timeout, function () {
                return _this._onHttpTimeout(request);
              });
            }
            request.on('response', function (response) {
              return _this._onHttpResponse(request, response);
            });
            request.on('error', function (error) {
              return _this._onHttpRequestError(request, error);
            });
            this.upload._startUpload(request);
            if (this._request === request) {
              this._dispatchProgress('loadstart');
            }
          };
          XMLHttpRequest.prototype._finalizeHeaders = function () {
            this._headers = __assign({}, this._headers, { Connection: 'keep-alive', Host: this._url.host, 'User-Agent': this._userAgent }, this._anonymous ? { Referer: 'about:blank' } : {});
            this.upload._finalizeHeaders(this._headers, this._loweredHeaders);
          };
          XMLHttpRequest.prototype._onHttpResponse = function (request, response) {
            var _this = this;
            if (this._request !== request) {
              return;
            }
            if (this.withCredentials && (response.headers['set-cookie'] || response.headers['set-cookie2'])) {
              XMLHttpRequest.cookieJar.setCookies(response.headers['set-cookie'] || response.headers['set-cookie2']);
            }
            if ([301, 302, 303, 307, 308].indexOf(response.statusCode) >= 0) {
              this._url = this._parseUrl(response.headers.location);
              this._method = 'GET';
              if (this._loweredHeaders['content-type']) {
                delete this._headers[this._loweredHeaders['content-type']];
                delete this._loweredHeaders['content-type'];
              }
              if (this._headers['Content-Type'] != null) {
                delete this._headers['Content-Type'];
              }
              delete this._headers['Content-Length'];
              this.upload._reset();
              this._finalizeHeaders();
              this._sendHxxpRequest();
              return;
            }
            this._response = response;
            this._response.on('data', function (data) {
              return _this._onHttpResponseData(response, data);
            });
            this._response.on('end', function () {
              return _this._onHttpResponseEnd(response);
            });
            this._response.on('close', function () {
              return _this._onHttpResponseClose(response);
            });
            this.responseUrl = this._url.href.split('#')[0];
            this.status = response.statusCode;
            this.statusText = http.STATUS_CODES[this.status];
            this._parseResponseHeaders(response);
            var lengthString = this._responseHeaders['content-length'] || '';
            this._totalBytes = +lengthString;
            this._lengthComputable = !!lengthString;
            this._setReadyState(XMLHttpRequest.HEADERS_RECEIVED);
          };
          XMLHttpRequest.prototype._onHttpResponseData = function (response, data) {
            if (this._response !== response) {
              return;
            }
            this._responseParts.push(new Buffer(data));
            this._loadedBytes += data.length;
            if (this.readyState !== XMLHttpRequest.LOADING) {
              this._setReadyState(XMLHttpRequest.LOADING);
            }
            this._dispatchProgress('progress');
          };
          XMLHttpRequest.prototype._onHttpResponseEnd = function (response) {
            if (this._response !== response) {
              return;
            }
            this._parseResponse();
            this._request = null;
            this._response = null;
            this._setReadyState(XMLHttpRequest.DONE);
            this._dispatchProgress('load');
            this._dispatchProgress('loadend');
          };
          XMLHttpRequest.prototype._onHttpResponseClose = function (response) {
            if (this._response !== response) {
              return;
            }
            var request = this._request;
            this._setError();
            request.abort();
            this._setReadyState(XMLHttpRequest.DONE);
            this._dispatchProgress('error');
            this._dispatchProgress('loadend');
          };
          XMLHttpRequest.prototype._onHttpTimeout = function (request) {
            if (this._request !== request) {
              return;
            }
            this._setError();
            request.abort();
            this._setReadyState(XMLHttpRequest.DONE);
            this._dispatchProgress('timeout');
            this._dispatchProgress('loadend');
          };
          XMLHttpRequest.prototype._onHttpRequestError = function (request, error) {
            if (this._request !== request) {
              return;
            }
            this._setError();
            request.abort();
            this._setReadyState(XMLHttpRequest.DONE);
            this._dispatchProgress('error');
            this._dispatchProgress('loadend');
          };
          XMLHttpRequest.prototype._dispatchProgress = function (eventType) {
            var event = new XMLHttpRequest.ProgressEvent(eventType);
            event.lengthComputable = this._lengthComputable;
            event.loaded = this._loadedBytes;
            event.total = this._totalBytes;
            this.dispatchEvent(event);
          };
          XMLHttpRequest.prototype._setError = function () {
            this._request = null;
            this._response = null;
            this._responseHeaders = null;
            this._responseParts = null;
          };
          XMLHttpRequest.prototype._parseUrl = function (urlString, user, password) {
            var absoluteUrl = this.nodejsBaseUrl == null ? urlString : url.resolve(this.nodejsBaseUrl, urlString);
            var xhrUrl = url.parse(absoluteUrl, false, true);
            xhrUrl.hash = null;
            var _a = (xhrUrl.auth || '').split(':'),
                xhrUser = _a[0],
                xhrPassword = _a[1];
            if (xhrUser || xhrPassword || user || password) {
              xhrUrl.auth = (user || xhrUser || '') + ":" + (password || xhrPassword || '');
            }
            return xhrUrl;
          };
          XMLHttpRequest.prototype._parseResponseHeaders = function (response) {
            this._responseHeaders = {};
            for (var name_1 in response.headers) {
              var loweredName = name_1.toLowerCase();
              if (this._privateHeaders[loweredName]) {
                continue;
              }
              this._responseHeaders[loweredName] = response.headers[name_1];
            }
            if (this._mimeOverride != null) {
              this._responseHeaders['content-type'] = this._mimeOverride;
            }
          };
          XMLHttpRequest.prototype._parseResponse = function () {
            var buffer = Buffer.concat(this._responseParts);
            this._responseParts = null;
            switch (this.responseType) {
              case 'json':
                this.responseText = null;
                try {
                  this.response = JSON.parse(buffer.toString('utf-8'));
                } catch (_a) {
                  this.response = null;
                }
                return;
              case 'buffer':
                this.responseText = null;
                this.response = buffer;
                return;
              case 'arraybuffer':
                this.responseText = null;
                var arrayBuffer = new ArrayBuffer(buffer.length);
                var view = new Uint8Array(arrayBuffer);
                for (var i = 0; i < buffer.length; i++) {
                  view[i] = buffer[i];
                }
                this.response = arrayBuffer;
                return;
              case 'text':
              default:
                try {
                  this.responseText = buffer.toString(this._parseResponseEncoding());
                } catch (_b) {
                  this.responseText = buffer.toString('binary');
                }
                this.response = this.responseText;
            }
          };
          XMLHttpRequest.prototype._parseResponseEncoding = function () {
            return (/;\s*charset=(.*)$/.exec(this._responseHeaders['content-type'] || '')[1] || 'utf-8'
            );
          };
          XMLHttpRequest.ProgressEvent = progress_event_1.ProgressEvent;
          XMLHttpRequest.InvalidStateError = errors_1.InvalidStateError;
          XMLHttpRequest.NetworkError = errors_1.NetworkError;
          XMLHttpRequest.SecurityError = errors_1.SecurityError;
          XMLHttpRequest.SyntaxError = errors_1.SyntaxError;
          XMLHttpRequest.XMLHttpRequestUpload = xml_http_request_upload_1.XMLHttpRequestUpload;
          XMLHttpRequest.UNSENT = 0;
          XMLHttpRequest.OPENED = 1;
          XMLHttpRequest.HEADERS_RECEIVED = 2;
          XMLHttpRequest.LOADING = 3;
          XMLHttpRequest.DONE = 4;
          XMLHttpRequest.cookieJar = Cookie.CookieJar();
          return XMLHttpRequest;
        }(xml_http_request_event_target_1.XMLHttpRequestEventTarget);
        exports.XMLHttpRequest = XMLHttpRequest;
        XMLHttpRequest.prototype.nodejsHttpAgent = http.globalAgent;
        XMLHttpRequest.prototype.nodejsHttpsAgent = https.globalAgent;
        XMLHttpRequest.prototype.nodejsBaseUrl = null;
      }).call(this, require('_process'), require("buffer").Buffer);
    }, { "./errors": 61, "./progress-event": 63, "./xml-http-request-event-target": 64, "./xml-http-request-upload": 65, "_process": 27, "buffer": 6, "cookiejar": 8, "http": 46, "https": 16, "os": 25, "url": 54 }], 67: [function (require, module, exports) {
      module.exports = extend;

      var hasOwnProperty = Object.prototype.hasOwnProperty;

      function extend() {
        var target = {};

        for (var i = 0; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      }
    }, {}], 68: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file errors.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @author Marek Kotewicz <marek@parity.io>
       * @date 2017
       */

      "use strict";

      module.exports = {
        ErrorResponse: function ErrorResponse(result) {
          var message = !!result && !!result.error && !!result.error.message ? result.error.message : JSON.stringify(result);
          return new Error('Returned error: ' + message);
        },
        InvalidNumberOfParams: function InvalidNumberOfParams(got, expected, method) {
          return new Error('Invalid number of parameters for "' + method + '". Got ' + got + ' expected ' + expected + '!');
        },
        InvalidConnection: function InvalidConnection(host) {
          return new Error('CONNECTION ERROR: Couldn\'t connect to node ' + host + '.');
        },
        InvalidProvider: function InvalidProvider() {
          return new Error('Provider not set or invalid');
        },
        InvalidResponse: function InvalidResponse(result) {
          var message = !!result && !!result.error && !!result.error.message ? result.error.message : 'Invalid JSON RPC response: ' + JSON.stringify(result);
          return new Error(message);
        },
        ConnectionTimeout: function ConnectionTimeout(ms) {
          return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
        }
      };
    }, {}], 69: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file formatters.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @author Marek Kotewicz <marek@parity.io>
       * @date 2017
       */

      "use strict";

      var _ = require('underscore');
      var utils = require('../../web3-utils');
      var Iban = require('../../web3-eth-iban');

      /**
       * Should the format output to a big number
       *
       * @method outputBigNumberFormatter
       * @param {String|Number|BigNumber} number
       * @returns {BigNumber} object
       */
      var outputBigNumberFormatter = function outputBigNumberFormatter(number) {
        return utils.toBN(number).toString(10);
      };

      var isPredefinedBlockNumber = function isPredefinedBlockNumber(blockNumber) {
        return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest';
      };

      var inputDefaultBlockNumberFormatter = function inputDefaultBlockNumberFormatter(blockNumber) {
        if (this && (blockNumber === undefined || blockNumber === null)) {
          return this.defaultBlock;
        }
        if (blockNumber === 'genesis' || blockNumber === 'earliest') {
          return '0x0';
        }
        return inputBlockNumberFormatter(blockNumber);
      };

      var inputBlockNumberFormatter = function inputBlockNumberFormatter(blockNumber) {
        if (blockNumber === undefined) {
          return undefined;
        } else if (isPredefinedBlockNumber(blockNumber)) {
          return blockNumber;
        }
        return utils.isHexStrict(blockNumber) ? _.isString(blockNumber) ? blockNumber.toLowerCase() : blockNumber : utils.numberToHex(blockNumber);
      };

      /**
       * Formats the input of a transaction and converts all values to HEX
       *
       * @method _txInputFormatter
       * @param {Object} transaction options
       * @returns object
       */
      var _txInputFormatter = function _txInputFormatter(options) {

        if (options.to) {
          // it might be contract creation
          options.to = inputAddressFormatter(options.to);
        }

        if (options.data && options.input) {
          throw new Error('You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.');
        }

        if (!options.data && options.input) {
          options.data = options.input;
          delete options.input;
        }

        if (options.data && !utils.isHex(options.data)) {
          throw new Error('The data field must be HEX encoded data.');
        }

        // allow both
        if (options.gas || options.gasLimit) {
          options.gas = options.gas || options.gasLimit;
        }

        ['gasPrice', 'gas', 'value', 'nonce'].filter(function (key) {
          return options[key] !== undefined;
        }).forEach(function (key) {
          options[key] = utils.numberToHex(options[key]);
        });

        return options;
      };

      /**
       * Formats the input of a transaction and converts all values to HEX
       *
       * @method inputCallFormatter
       * @param {Object} transaction options
       * @returns object
      */
      var inputCallFormatter = function inputCallFormatter(options) {

        options = _txInputFormatter(options);

        var from = options.from || (this ? this.defaultAccount : null);

        if (from) {
          options.from = inputAddressFormatter(from);
        }

        return options;
      };

      /**
       * Formats the input of a transaction and converts all values to HEX
       *
       * @method inputTransactionFormatter
       * @param {Object} options
       * @returns object
      */
      var inputTransactionFormatter = function inputTransactionFormatter(options) {

        options = _txInputFormatter(options);

        // check from, only if not number, or object
        if (!_.isNumber(options.from) && !_.isObject(options.from)) {
          options.from = options.from || (this ? this.defaultAccount : null);

          if (!options.from && !_.isNumber(options.from)) {
            throw new Error('The send transactions "from" field must be defined!');
          }

          options.from = inputAddressFormatter(options.from);
        }

        return options;
      };

      /**
       * Hex encodes the data passed to eth_sign and personal_sign
       *
       * @method inputSignFormatter
       * @param {String} data
       * @returns {String}
       */
      var inputSignFormatter = function inputSignFormatter(data) {
        return utils.isHexStrict(data) ? data : utils.utf8ToHex(data);
      };

      /**
       * Formats the output of a transaction to its proper values
       *
       * @method outputTransactionFormatter
       * @param {Object} tx
       * @returns {Object}
      */
      var outputTransactionFormatter = function outputTransactionFormatter(tx) {
        if (tx.blockNumber !== null) tx.blockNumber = utils.hexToNumber(tx.blockNumber);
        if (tx.transactionIndex !== null) tx.transactionIndex = utils.hexToNumber(tx.transactionIndex);
        tx.nonce = utils.hexToNumber(tx.nonce);
        tx.gas = utils.hexToNumber(tx.gas);
        tx.gasPrice = outputBigNumberFormatter(tx.gasPrice);
        tx.value = outputBigNumberFormatter(tx.value);

        if (tx.to && utils.isAddress(tx.to)) {
          // tx.to could be `0x0` or `null` while contract creation
          tx.to = utils.toChecksumAddress(tx.to);
        } else {
          tx.to = null; // set to `null` if invalid address
        }

        if (tx.from) {
          tx.from = utils.toChecksumAddress(tx.from);
        }

        return tx;
      };

      /**
       * Formats the output of a transaction receipt to its proper values
       *
       * @method outputTransactionReceiptFormatter
       * @param {Object} receipt
       * @returns {Object}
      */
      var outputTransactionReceiptFormatter = function outputTransactionReceiptFormatter(receipt) {
        if ((typeof receipt === "undefined" ? "undefined" : _typeof(receipt)) !== 'object') {
          throw new Error('Received receipt is invalid: ' + receipt);
        }

        if (receipt.blockNumber !== null) receipt.blockNumber = utils.hexToNumber(receipt.blockNumber);
        if (receipt.transactionIndex !== null) receipt.transactionIndex = utils.hexToNumber(receipt.transactionIndex);
        receipt.cumulativeGasUsed = utils.hexToNumber(receipt.cumulativeGasUsed);
        receipt.gasUsed = utils.hexToNumber(receipt.gasUsed);

        if (_.isArray(receipt.logs)) {
          receipt.logs = receipt.logs.map(outputLogFormatter);
        }

        if (receipt.contractAddress) {
          receipt.contractAddress = utils.toChecksumAddress(receipt.contractAddress);
        }

        if (typeof receipt.status !== 'undefined') {
          receipt.status = Boolean(parseInt(receipt.status));
        }

        return receipt;
      };

      /**
       * Formats the output of a block to its proper values
       *
       * @method outputBlockFormatter
       * @param {Object} block
       * @returns {Object}
      */
      var outputBlockFormatter = function outputBlockFormatter(block) {

        // transform to number
        block.gasLimit = utils.hexToNumber(block.gasLimit);
        block.gasUsed = utils.hexToNumber(block.gasUsed);
        block.size = utils.hexToNumber(block.size);
        block.timestamp = utils.hexToNumber(block.timestamp);
        if (block.number !== null) block.number = utils.hexToNumber(block.number);

        if (block.difficulty) block.difficulty = outputBigNumberFormatter(block.difficulty);
        if (block.totalDifficulty) block.totalDifficulty = outputBigNumberFormatter(block.totalDifficulty);

        if (_.isArray(block.transactions)) {
          block.transactions.forEach(function (item) {
            if (!_.isString(item)) return outputTransactionFormatter(item);
          });
        }

        if (block.miner) block.miner = utils.toChecksumAddress(block.miner);

        return block;
      };

      /**
       * Formats the input of a log
       *
       * @method inputLogFormatter
       * @param {Object} log object
       * @returns {Object} log
      */
      var inputLogFormatter = function inputLogFormatter(options) {
        var toTopic = function toTopic(value) {

          if (value === null || typeof value === 'undefined') return null;

          value = String(value);

          if (value.indexOf('0x') === 0) return value;else return utils.fromUtf8(value);
        };

        if (options.fromBlock) options.fromBlock = inputBlockNumberFormatter(options.fromBlock);

        if (options.toBlock) options.toBlock = inputBlockNumberFormatter(options.toBlock);

        // make sure topics, get converted to hex
        options.topics = options.topics || [];
        options.topics = options.topics.map(function (topic) {
          return _.isArray(topic) ? topic.map(toTopic) : toTopic(topic);
        });

        toTopic = null;

        if (options.address) {
          options.address = _.isArray(options.address) ? options.address.map(function (addr) {
            return inputAddressFormatter(addr);
          }) : inputAddressFormatter(options.address);
        }

        return options;
      };

      /**
       * Formats the output of a log
       *
       * @method outputLogFormatter
       * @param {Object} log object
       * @returns {Object} log
      */
      var outputLogFormatter = function outputLogFormatter(log) {

        // generate a custom log id
        if (typeof log.blockHash === 'string' && typeof log.transactionHash === 'string' && typeof log.logIndex === 'string') {
          var shaId = utils.sha3(log.blockHash.replace('0x', '') + log.transactionHash.replace('0x', '') + log.logIndex.replace('0x', ''));
          log.id = 'log_' + shaId.replace('0x', '').substr(0, 8);
        } else if (!log.id) {
          log.id = null;
        }

        if (log.blockNumber !== null) log.blockNumber = utils.hexToNumber(log.blockNumber);
        if (log.transactionIndex !== null) log.transactionIndex = utils.hexToNumber(log.transactionIndex);
        if (log.logIndex !== null) log.logIndex = utils.hexToNumber(log.logIndex);

        if (log.address) {
          log.address = utils.toChecksumAddress(log.address);
        }

        return log;
      };

      /**
       * Formats the input of a whisper post and converts all values to HEX
       *
       * @method inputPostFormatter
       * @param {Object} transaction object
       * @returns {Object}
      */
      var inputPostFormatter = function inputPostFormatter(post) {

        // post.payload = utils.toHex(post.payload);

        if (post.ttl) post.ttl = utils.numberToHex(post.ttl);
        if (post.workToProve) post.workToProve = utils.numberToHex(post.workToProve);
        if (post.priority) post.priority = utils.numberToHex(post.priority);

        // fallback
        if (!_.isArray(post.topics)) {
          post.topics = post.topics ? [post.topics] : [];
        }

        // format the following options
        post.topics = post.topics.map(function (topic) {
          // convert only if not hex
          return topic.indexOf('0x') === 0 ? topic : utils.fromUtf8(topic);
        });

        return post;
      };

      /**
       * Formats the output of a received post message
       *
       * @method outputPostFormatter
       * @param {Object}
       * @returns {Object}
       */
      var outputPostFormatter = function outputPostFormatter(post) {

        post.expiry = utils.hexToNumber(post.expiry);
        post.sent = utils.hexToNumber(post.sent);
        post.ttl = utils.hexToNumber(post.ttl);
        post.workProved = utils.hexToNumber(post.workProved);
        // post.payloadRaw = post.payload;
        // post.payload = utils.hexToAscii(post.payload);

        // if (utils.isJson(post.payload)) {
        //     post.payload = JSON.parse(post.payload);
        // }

        // format the following options
        if (!post.topics) {
          post.topics = [];
        }
        post.topics = post.topics.map(function (topic) {
          return utils.toUtf8(topic);
        });

        return post;
      };

      var inputAddressFormatter = function inputAddressFormatter(address) {
        var iban = new Iban(address);
        if (iban.isValid() && iban.isDirect()) {
          return iban.toAddress().toLowerCase();
        } else if (utils.isAddress(address)) {
          return '0x' + address.toLowerCase().replace('0x', '');
        }
        throw new Error('Provided address "' + address + '" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can\'t be converted.');
      };

      var outputSyncingFormatter = function outputSyncingFormatter(result) {

        result.startingBlock = utils.hexToNumber(result.startingBlock);
        result.currentBlock = utils.hexToNumber(result.currentBlock);
        result.highestBlock = utils.hexToNumber(result.highestBlock);
        if (result.knownStates) {
          result.knownStates = utils.hexToNumber(result.knownStates);
          result.pulledStates = utils.hexToNumber(result.pulledStates);
        }

        return result;
      };

      module.exports = {
        inputDefaultBlockNumberFormatter: inputDefaultBlockNumberFormatter,
        inputBlockNumberFormatter: inputBlockNumberFormatter,
        inputCallFormatter: inputCallFormatter,
        inputTransactionFormatter: inputTransactionFormatter,
        inputAddressFormatter: inputAddressFormatter,
        inputPostFormatter: inputPostFormatter,
        inputLogFormatter: inputLogFormatter,
        inputSignFormatter: inputSignFormatter,
        outputBigNumberFormatter: outputBigNumberFormatter,
        outputTransactionFormatter: outputTransactionFormatter,
        outputTransactionReceiptFormatter: outputTransactionReceiptFormatter,
        outputBlockFormatter: outputBlockFormatter,
        outputLogFormatter: outputLogFormatter,
        outputPostFormatter: outputPostFormatter,
        outputSyncingFormatter: outputSyncingFormatter
      };
    }, { "../../web3-eth-iban": 81, "../../web3-utils": 86, "underscore": 53 }], 70: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var errors = require('./errors');
      var formatters = require('./formatters');

      module.exports = {
        errors: errors,
        formatters: formatters
      };
    }, { "./errors": 68, "./formatters": 69 }], 71: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @author Marek Kotewicz <marek@parity.io>
       * @date 2017
       */

      "use strict";

      var _ = require('underscore');
      var errors = require('../../web3-core-helpers').errors;
      var formatters = require('../../web3-core-helpers').formatters;
      var utils = require('../../web3-utils');
      var promiEvent = require('../../web3-core-promievent');
      var Subscriptions = require('../../web3-core-subscriptions').subscriptions;

      var TIMEOUTBLOCK = 50;
      var POLLINGTIMEOUT = 15 * TIMEOUTBLOCK; // ~average block time (seconds) * TIMEOUTBLOCK
      var CONFIRMATIONBLOCKS = 24;

      var Method = function Method(options) {

        if (!options.call || !options.name) {
          throw new Error('When creating a method you need to provide at least the "name" and "call" property.');
        }

        this.name = options.name;
        this.call = options.call;
        this.params = options.params || 0;
        this.inputFormatter = options.inputFormatter;
        this.outputFormatter = options.outputFormatter;
        this.transformPayload = options.transformPayload;
        this.extraFormatters = options.extraFormatters;

        this.requestManager = options.requestManager;

        // reference to eth.accounts
        this.accounts = options.accounts;

        this.defaultBlock = options.defaultBlock || 'latest';
        this.defaultAccount = options.defaultAccount || null;
      };

      Method.prototype.setRequestManager = function (requestManager, accounts) {
        this.requestManager = requestManager;

        // reference to eth.accounts
        if (accounts) {
          this.accounts = accounts;
        }
      };

      Method.prototype.createFunction = function (requestManager, accounts) {
        var func = this.buildCall();
        func.call = this.call;

        this.setRequestManager(requestManager || this.requestManager, accounts || this.accounts);

        return func;
      };

      Method.prototype.attachToObject = function (obj) {
        var func = this.buildCall();
        func.call = this.call;
        var name = this.name.split('.');
        if (name.length > 1) {
          obj[name[0]] = obj[name[0]] || {};
          obj[name[0]][name[1]] = func;
        } else {
          obj[name[0]] = func;
        }
      };

      /**
       * Should be used to determine name of the jsonrpc method based on arguments
       *
       * @method getCall
       * @param {Array} arguments
       * @return {String} name of jsonrpc method
       */
      Method.prototype.getCall = function (args) {
        return _.isFunction(this.call) ? this.call(args) : this.call;
      };

      /**
       * Should be used to extract callback from array of arguments. Modifies input param
       *
       * @method extractCallback
       * @param {Array} arguments
       * @return {Function|Null} callback, if exists
       */
      Method.prototype.extractCallback = function (args) {
        if (_.isFunction(args[args.length - 1])) {
          return args.pop(); // modify the args array!
        }
      };

      /**
       * Should be called to check if the number of arguments is correct
       *
       * @method validateArgs
       * @param {Array} arguments
       * @throws {Error} if it is not
       */
      Method.prototype.validateArgs = function (args) {
        if (args.length !== this.params) {
          throw errors.InvalidNumberOfParams(args.length, this.params, this.name);
        }
      };

      /**
       * Should be called to format input args of method
       *
       * @method formatInput
       * @param {Array}
       * @return {Array}
       */
      Method.prototype.formatInput = function (args) {
        var _this = this;

        if (!this.inputFormatter) {
          return args;
        }

        return this.inputFormatter.map(function (formatter, index) {
          // bind this for defaultBlock, and defaultAccount
          return formatter ? formatter.call(_this, args[index]) : args[index];
        });
      };

      /**
       * Should be called to format output(result) of method
       *
       * @method formatOutput
       * @param {Object}
       * @return {Object}
       */
      Method.prototype.formatOutput = function (result) {
        var _this = this;

        if (_.isArray(result)) {
          return result.map(function (res) {
            return _this.outputFormatter && res ? _this.outputFormatter(res) : res;
          });
        } else {
          return this.outputFormatter && result ? this.outputFormatter(result) : result;
        }
      };

      /**
       * Should create payload from given input args
       *
       * @method toPayload
       * @param {Array} args
       * @return {Object}
       */
      Method.prototype.toPayload = function (args) {
        var call = this.getCall(args);
        var callback = this.extractCallback(args);
        var params = this.formatInput(args);
        this.validateArgs(params);

        var payload = {
          method: call,
          params: params,
          callback: callback
        };

        if (this.transformPayload) {
          payload = this.transformPayload(payload);
        }

        return payload;
      };

      Method.prototype._confirmTransaction = function (defer, result, payload) {
        var method = this,
            promiseResolved = false,
            canUnsubscribe = true,
            timeoutCount = 0,
            confirmationCount = 0,
            intervalId = null,
            receiptJSON = '',
            gasProvided = _.isObject(payload.params[0]) && payload.params[0].gas ? payload.params[0].gas : null,
            isContractDeployment = _.isObject(payload.params[0]) && payload.params[0].data && payload.params[0].from && !payload.params[0].to;

        // add custom send Methods
        var _ethereumCalls = [new Method({
          name: 'getTransactionReceipt',
          call: 'eth_getTransactionReceipt',
          params: 1,
          inputFormatter: [null],
          outputFormatter: formatters.outputTransactionReceiptFormatter
        }), new Method({
          name: 'getCode',
          call: 'eth_getCode',
          params: 2,
          inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter]
        }), new Subscriptions({
          name: 'subscribe',
          type: 'eth',
          subscriptions: {
            'newBlockHeaders': {
              subscriptionName: 'newHeads', // replace subscription with this name
              params: 0,
              outputFormatter: formatters.outputBlockFormatter
            }
          }
        })];
        // attach methods to this._ethereumCall
        var _ethereumCall = {};
        _.each(_ethereumCalls, function (mthd) {
          mthd.attachToObject(_ethereumCall);
          mthd.requestManager = method.requestManager; // assign rather than call setRequestManager()
        });

        // fire "receipt" and confirmation events and resolve after
        var checkConfirmation = function checkConfirmation(existingReceipt, isPolling, err, blockHeader, sub) {
          if (!err) {
            // create fake unsubscribe
            if (!sub) {
              sub = {
                unsubscribe: function unsubscribe() {
                  clearInterval(intervalId);
                }
              };
            }
            // if we have a valid receipt we don't need to send a request
            return (existingReceipt ? promiEvent.resolve(existingReceipt) : _ethereumCall.getTransactionReceipt(result)).
            // catch error from requesting receipt
            catch(function (err) {
              sub.unsubscribe();
              promiseResolved = true;
              utils._fireError({ message: 'Failed to check for transaction receipt:', data: err }, defer.eventEmitter, defer.reject);
            })
            // if CONFIRMATION listener exists check for confirmations, by setting canUnsubscribe = false
            .then(function (receipt) {
              if (!receipt || !receipt.blockHash) {
                throw new Error('Receipt missing or blockHash null');
              }

              // apply extra formatters
              if (method.extraFormatters && method.extraFormatters.receiptFormatter) {
                receipt = method.extraFormatters.receiptFormatter(receipt);
              }

              // check if confirmation listener exists
              if (defer.eventEmitter.listeners('confirmation').length > 0) {

                // If there was an immediately retrieved receipt, it's already
                // been confirmed by the direct call to checkConfirmation needed
                // for parity instant-seal
                if (existingReceipt === undefined || confirmationCount !== 0) {
                  defer.eventEmitter.emit('confirmation', confirmationCount, receipt);
                }

                canUnsubscribe = false;
                confirmationCount++;

                if (confirmationCount === CONFIRMATIONBLOCKS + 1) {
                  // add 1 so we account for conf 0
                  sub.unsubscribe();
                  defer.eventEmitter.removeAllListeners();
                }
              }

              return receipt;
            })
            // CHECK for CONTRACT DEPLOYMENT
            .then(function (receipt) {

              if (isContractDeployment && !promiseResolved) {

                if (!receipt.contractAddress) {

                  if (canUnsubscribe) {
                    sub.unsubscribe();
                    promiseResolved = true;
                  }

                  utils._fireError(new Error('The transaction receipt didn\'t contain a contract address.'), defer.eventEmitter, defer.reject);
                  return;
                }

                _ethereumCall.getCode(receipt.contractAddress, function (e, code) {

                  if (!code) {
                    return;
                  }

                  if (code.length > 2) {
                    defer.eventEmitter.emit('receipt', receipt);

                    // if contract, return instance instead of receipt
                    if (method.extraFormatters && method.extraFormatters.contractDeployFormatter) {
                      defer.resolve(method.extraFormatters.contractDeployFormatter(receipt));
                    } else {
                      defer.resolve(receipt);
                    }

                    // need to remove listeners, as they aren't removed automatically when succesfull
                    if (canUnsubscribe) {
                      defer.eventEmitter.removeAllListeners();
                    }
                  } else {
                    utils._fireError(new Error('The contract code couldn\'t be stored, please check your gas limit.'), defer.eventEmitter, defer.reject);
                  }

                  if (canUnsubscribe) {
                    sub.unsubscribe();
                  }
                  promiseResolved = true;
                });
              }

              return receipt;
            })
            // CHECK for normal tx check for receipt only
            .then(function (receipt) {

              if (!isContractDeployment && !promiseResolved) {

                if (!receipt.outOfGas && (!gasProvided || gasProvided !== receipt.gasUsed) && (receipt.status === true || receipt.status === '0x1' || typeof receipt.status === 'undefined')) {
                  defer.eventEmitter.emit('receipt', receipt);
                  defer.resolve(receipt);

                  // need to remove listeners, as they aren't removed automatically when succesfull
                  if (canUnsubscribe) {
                    defer.eventEmitter.removeAllListeners();
                  }
                } else {
                  receiptJSON = JSON.stringify(receipt, null, 2);
                  if (receipt.status === false || receipt.status === '0x0') {
                    utils._fireError(new Error("Transaction has been reverted by the EVM:\n" + receiptJSON), defer.eventEmitter, defer.reject);
                  } else {
                    utils._fireError(new Error("Transaction ran out of gas. Please provide more gas:\n" + receiptJSON), defer.eventEmitter, defer.reject);
                  }
                }

                if (canUnsubscribe) {
                  sub.unsubscribe();
                }
                promiseResolved = true;
              }
            })
            // time out the transaction if not mined after 50 blocks
            .catch(function () {
              timeoutCount++;

              // check to see if we are http polling
              if (!!isPolling) {
                // polling timeout is different than TIMEOUTBLOCK blocks since we are triggering every second
                if (timeoutCount - 1 >= POLLINGTIMEOUT) {
                  sub.unsubscribe();
                  promiseResolved = true;
                  utils._fireError(new Error('Transaction was not mined within' + POLLINGTIMEOUT + ' seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!'), defer.eventEmitter, defer.reject);
                }
              } else {
                if (timeoutCount - 1 >= TIMEOUTBLOCK) {
                  sub.unsubscribe();
                  promiseResolved = true;
                  utils._fireError(new Error('Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'), defer.eventEmitter, defer.reject);
                }
              }
            });
          } else {
            sub.unsubscribe();
            promiseResolved = true;
            utils._fireError({ message: 'Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.', data: err }, defer.eventEmitter, defer.reject);
          }
        };

        // start watching for confirmation depending on the support features of the provider
        var startWatching = function (existingReceipt) {
          // if provider allows PUB/SUB
          if (_.isFunction(this.requestManager.provider.on)) {
            _ethereumCall.subscribe('newBlockHeaders', checkConfirmation.bind(null, existingReceipt, false));
          } else {
            intervalId = setInterval(checkConfirmation.bind(null, existingReceipt, true), 1000);
          }
        }.bind(this);

        // first check if we already have a confirmed transaction
        _ethereumCall.getTransactionReceipt(result).then(function (receipt) {
          if (receipt && receipt.blockHash) {
            if (defer.eventEmitter.listeners('confirmation').length > 0) {
              // We must keep on watching for new Blocks, if a confirmation listener is present
              startWatching(receipt);
            }
            checkConfirmation(receipt, false);
          } else if (!promiseResolved) {
            startWatching();
          }
        }).catch(function () {
          if (!promiseResolved) startWatching();
        });
      };

      var getWallet = function getWallet(from, accounts) {
        var wallet = null;

        // is index given
        if (_.isNumber(from)) {
          wallet = accounts.wallet[from];

          // is account given
        } else if (_.isObject(from) && from.address && from.privateKey) {
          wallet = from;

          // search in wallet for address
        } else {
          wallet = accounts.wallet[from.toLowerCase()];
        }

        return wallet;
      };

      Method.prototype.buildCall = function () {
        var method = this,
            isSendTx = method.call === 'eth_sendTransaction' || method.call === 'eth_sendRawTransaction'; // || method.call === 'personal_sendTransaction'

        // actual send function
        var send = function send() {
          var defer = promiEvent(!isSendTx),
              payload = method.toPayload(Array.prototype.slice.call(arguments));

          // CALLBACK function
          var sendTxCallback = function sendTxCallback(err, result) {
            try {
              result = method.formatOutput(result);
            } catch (e) {
              err = e;
            }

            if (result instanceof Error) {
              err = result;
            }

            if (!err) {
              if (payload.callback) {
                payload.callback(null, result);
              }
            } else {
              if (err.error) {
                err = err.error;
              }

              return utils._fireError(err, defer.eventEmitter, defer.reject, payload.callback);
            }

            // return PROMISE
            if (!isSendTx) {

              if (!err) {
                defer.resolve(result);
              }

              // return PROMIEVENT
            } else {
              defer.eventEmitter.emit('transactionHash', result);

              method._confirmTransaction(defer, result, payload);
            }
          };

          // SENDS the SIGNED SIGNATURE
          var sendSignedTx = function sendSignedTx(sign) {

            var signedPayload = _.extend({}, payload, {
              method: 'eth_sendRawTransaction',
              params: [sign.rawTransaction]
            });

            method.requestManager.send(signedPayload, sendTxCallback);
          };

          var sendRequest = function sendRequest(payload, method) {

            if (method && method.accounts && method.accounts.wallet && method.accounts.wallet.length) {
              var wallet;

              // ETH_SENDTRANSACTION
              if (payload.method === 'eth_sendTransaction') {
                var tx = payload.params[0];
                wallet = getWallet(_.isObject(tx) ? tx.from : null, method.accounts);

                // If wallet was found, sign tx, and send using sendRawTransaction
                if (wallet && wallet.privateKey) {
                  return method.accounts.signTransaction(_.omit(tx, 'from'), wallet.privateKey).then(sendSignedTx);
                }

                // ETH_SIGN
              } else if (payload.method === 'eth_sign') {
                var data = payload.params[1];
                wallet = getWallet(payload.params[0], method.accounts);

                // If wallet was found, sign tx, and send using sendRawTransaction
                if (wallet && wallet.privateKey) {
                  var sign = method.accounts.sign(data, wallet.privateKey);

                  if (payload.callback) {
                    payload.callback(null, sign.signature);
                  }

                  defer.resolve(sign.signature);
                  return;
                }
              }
            }

            return method.requestManager.send(payload, sendTxCallback);
          };

          // Send the actual transaction
          if (isSendTx && _.isObject(payload.params[0]) && typeof payload.params[0].gasPrice === 'undefined') {

            var getGasPrice = new Method({
              name: 'getGasPrice',
              call: 'eth_gasPrice',
              params: 0
            }).createFunction(method.requestManager);

            getGasPrice(function (err, gasPrice) {

              if (gasPrice) {
                payload.params[0].gasPrice = gasPrice;
              }
              sendRequest(payload, method);
            });
          } else {
            sendRequest(payload, method);
          }

          return defer.eventEmitter;
        };

        // necessary to attach things to the method
        send.method = method;
        // necessary for batch requests
        send.request = this.request.bind(this);
        return send;
      };

      /**
       * Should be called to create the pure JSONRPC request which can be used in a batch request
       *
       * @method request
       * @return {Object} jsonrpc request
       */
      Method.prototype.request = function () {
        var payload = this.toPayload(Array.prototype.slice.call(arguments));
        payload.format = this.formatOutput.bind(this);
        return payload;
      };

      module.exports = Method;
    }, { "../../web3-core-helpers": 70, "../../web3-core-promievent": 72, "../../web3-core-subscriptions": 77, "../../web3-utils": 86, "underscore": 53 }], 72: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2016
       */

      "use strict";

      var EventEmitter = require('eventemitter3');
      var Promise = require("any-promise");

      /**
       * This function generates a defer promise and adds eventEmitter functionality to it
       *
       * @method eventifiedPromise
       */
      var PromiEvent = function PromiEvent(justPromise) {
        var resolve,
            reject,
            eventEmitter = new Promise(function () {
          resolve = arguments[0];
          reject = arguments[1];
        });

        if (justPromise) {
          return {
            resolve: resolve,
            reject: reject,
            eventEmitter: eventEmitter
          };
        }

        // get eventEmitter
        var emitter = new EventEmitter();

        // add eventEmitter to the promise
        eventEmitter._events = emitter._events;
        eventEmitter.emit = emitter.emit;
        eventEmitter.on = emitter.on;
        eventEmitter.once = emitter.once;
        eventEmitter.off = emitter.off;
        eventEmitter.listeners = emitter.listeners;
        eventEmitter.addListener = emitter.addListener;
        eventEmitter.removeListener = emitter.removeListener;
        eventEmitter.removeAllListeners = emitter.removeAllListeners;

        return {
          resolve: resolve,
          reject: reject,
          eventEmitter: eventEmitter
        };
      };

      PromiEvent.resolve = function (value) {
        var promise = PromiEvent(true);
        promise.resolve(value);
        return promise.eventEmitter;
      };

      module.exports = PromiEvent;
    }, { "any-promise": 1, "eventemitter3": 14 }], 73: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file batch.js
       * @author Marek Kotewicz <marek@ethdev.com>
       * @date 2015
       */

      "use strict";

      var Jsonrpc = require('./jsonrpc');
      var errors = require('../../web3-core-helpers').errors;

      var Batch = function Batch(requestManager) {
        this.requestManager = requestManager;
        this.requests = [];
      };

      /**
       * Should be called to add create new request to batch request
       *
       * @method add
       * @param {Object} jsonrpc requet object
       */
      Batch.prototype.add = function (request) {
        this.requests.push(request);
      };

      /**
       * Should be called to execute batch request
       *
       * @method execute
       */
      Batch.prototype.execute = function () {
        var requests = this.requests;
        this.requestManager.sendBatch(requests, function (err, results) {
          results = results || [];
          requests.map(function (request, index) {
            return results[index] || {};
          }).forEach(function (result, index) {
            if (requests[index].callback) {
              if (result && result.error) {
                return requests[index].callback(errors.ErrorResponse(result));
              }

              if (!Jsonrpc.isValidResponse(result)) {
                return requests[index].callback(errors.InvalidResponse(result));
              }

              try {
                requests[index].callback(null, requests[index].format ? requests[index].format(result.result) : result.result);
              } catch (err) {
                requests[index].callback(err);
              }
            }
          });
        });
      };

      module.exports = Batch;
    }, { "../../web3-core-helpers": 70, "./jsonrpc": 76 }], 74: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file givenProvider.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var givenProvider = null;

      // ADD GIVEN PROVIDER
      /* jshint ignore:start */
      var global;
      try {
        global = Function('return this')();
      } catch (e) {
        global = window;
      }

      // EthereumProvider
      if (typeof global.ethereumProvider !== 'undefined') {
        givenProvider = global.ethereumProvider;

        // Legacy web3.currentProvider
      } else if (typeof global.web3 !== 'undefined' && global.web3.currentProvider) {

        if (global.web3.currentProvider.sendAsync) {
          global.web3.currentProvider.send = global.web3.currentProvider.sendAsync;
          delete global.web3.currentProvider.sendAsync;
        }

        // if connection is 'ipcProviderWrapper', add subscription support
        if (!global.web3.currentProvider.on && global.web3.currentProvider.connection && global.web3.currentProvider.connection.constructor.name === 'ipcProviderWrapper') {

          global.web3.currentProvider.on = function (type, callback) {

            if (typeof callback !== 'function') throw new Error('The second parameter callback must be a function.');

            switch (type) {
              case 'data':
                this.connection.on('data', function (data) {
                  var result = '';

                  data = data.toString();

                  try {
                    result = JSON.parse(data);
                  } catch (e) {
                    return callback(new Error('Couldn\'t parse response data' + data));
                  }

                  // notification
                  if (!result.id && result.method.indexOf('_subscription') !== -1) {
                    callback(null, result);
                  }
                });
                break;

              default:
                this.connection.on(type, callback);
                break;
            }
          };
        }

        givenProvider = global.web3.currentProvider;
      }
      /* jshint ignore:end */

      module.exports = givenProvider;
    }, {}], 75: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var _ = require('underscore');
      var errors = require('../../web3-core-helpers').errors;
      var Jsonrpc = require('./jsonrpc.js');
      var BatchManager = require('./batch.js');
      var givenProvider = require('./givenProvider.js');

      /**
      * It's responsible for passing messages to providers
      * It's also responsible for polling the ethereum node for incoming messages
      * Default poll timeout is 1 second
      * Singleton
      */
      var RequestManager = function RequestManager(provider) {
        this.provider = null;
        this.providers = RequestManager.providers;

        this.setProvider(provider);
        this.subscriptions = {};
      };

      RequestManager.givenProvider = givenProvider;

      RequestManager.providers = {
        WebsocketProvider: require('../../web3-providers-ws'),
        HttpProvider: require('../../web3-providers-http'),
        IpcProvider: require('../../web3-providers-ipc')
      };

      /**
       * Should be used to set provider of request manager
       *
       * @method setProvider
       * @param {Object} p
       */
      RequestManager.prototype.setProvider = function (p, net) {
        var _this = this;

        // autodetect provider
        if (p && typeof p === 'string' && this.providers) {

          // HTTP
          if (/^http(s)?:\/\//i.test(p)) {
            p = new this.providers.HttpProvider(p);

            // WS
          } else if (/^ws(s)?:\/\//i.test(p)) {
            p = new this.providers.WebsocketProvider(p);

            // IPC
          } else if (p && (typeof net === "undefined" ? "undefined" : _typeof(net)) === 'object' && typeof net.connect === 'function') {
            p = new this.providers.IpcProvider(p, net);
          } else if (p) {
            throw new Error('Can\'t autodetect provider for "' + p + '"');
          }
        }

        // reset the old one before changing, if still connected
        if (this.provider && this.provider.connected) this.clearSubscriptions();

        this.provider = p || null;

        // listen to incoming notifications
        if (this.provider && this.provider.on) {
          this.provider.on('data', function requestManagerNotification(result, deprecatedResult) {
            result = result || deprecatedResult; // this is for possible old providers, which may had the error first handler

            // check for result.method, to prevent old providers errors to pass as result
            if (result.method && _this.subscriptions[result.params.subscription] && _this.subscriptions[result.params.subscription].callback) {
              _this.subscriptions[result.params.subscription].callback(null, result.params.result);
            }
          });
          // TODO add error, end, timeout, connect??
          // this.provider.on('error', function requestManagerNotification(result){
          //     Object.keys(_this.subscriptions).forEach(function(id){
          //         if(_this.subscriptions[id].callback)
          //             _this.subscriptions[id].callback(err);
          //     });
          // }
        }
      };

      /**
       * Should be used to asynchronously send request
       *
       * @method sendAsync
       * @param {Object} data
       * @param {Function} callback
       */
      RequestManager.prototype.send = function (data, callback) {
        callback = callback || function () {};

        if (!this.provider) {
          return callback(errors.InvalidProvider());
        }

        var payload = Jsonrpc.toPayload(data.method, data.params);
        this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](payload, function (err, result) {
          if (result && result.id && payload.id !== result.id) return callback(new Error('Wrong response id "' + result.id + '" (expected: "' + payload.id + '") in ' + JSON.stringify(payload)));

          if (err) {
            return callback(err);
          }

          if (result && result.error) {
            return callback(errors.ErrorResponse(result));
          }

          if (!Jsonrpc.isValidResponse(result)) {
            return callback(errors.InvalidResponse(result));
          }

          callback(null, result.result);
        });
      };

      /**
       * Should be called to asynchronously send batch request
       *
       * @method sendBatch
       * @param {Array} batch data
       * @param {Function} callback
       */
      RequestManager.prototype.sendBatch = function (data, callback) {
        if (!this.provider) {
          return callback(errors.InvalidProvider());
        }

        var payload = Jsonrpc.toBatchPayload(data);
        this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](payload, function (err, results) {
          if (err) {
            return callback(err);
          }

          if (!_.isArray(results)) {
            return callback(errors.InvalidResponse(results));
          }

          callback(null, results);
        });
      };

      /**
       * Waits for notifications
       *
       * @method addSubscription
       * @param {String} id           the subscription id
       * @param {String} name         the subscription name
       * @param {String} type         the subscription namespace (eth, personal, etc)
       * @param {Function} callback   the callback to call for incoming notifications
       */
      RequestManager.prototype.addSubscription = function (id, name, type, callback) {
        if (this.provider.on) {
          this.subscriptions[id] = {
            callback: callback,
            type: type,
            name: name
          };
        } else {
          throw new Error('The provider doesn\'t support subscriptions: ' + this.provider.constructor.name);
        }
      };

      /**
       * Waits for notifications
       *
       * @method removeSubscription
       * @param {String} id           the subscription id
       * @param {Function} callback   fired once the subscription is removed
       */
      RequestManager.prototype.removeSubscription = function (id, callback) {
        var _this = this;

        if (this.subscriptions[id]) {

          this.send({
            method: this.subscriptions[id].type + '_unsubscribe',
            params: [id]
          }, callback);

          // remove subscription
          delete _this.subscriptions[id];
        }
      };

      /**
       * Should be called to reset the subscriptions
       *
       * @method reset
       */
      RequestManager.prototype.clearSubscriptions = function (keepIsSyncing) {
        var _this = this;

        // uninstall all subscriptions
        Object.keys(this.subscriptions).forEach(function (id) {
          if (!keepIsSyncing || _this.subscriptions[id].name !== 'syncing') _this.removeSubscription(id);
        });

        //  reset notification callbacks etc.
        if (this.provider.reset) this.provider.reset();
      };

      module.exports = {
        Manager: RequestManager,
        BatchManager: BatchManager
      };
    }, { "../../web3-core-helpers": 70, "../../web3-providers-http": 83, "../../web3-providers-ipc": 84, "../../web3-providers-ws": 85, "./batch.js": 73, "./givenProvider.js": 74, "./jsonrpc.js": 76, "underscore": 53 }], 76: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /** @file jsonrpc.js
       * @authors:
       *   Fabian Vogelsteller <fabian@ethereum.org>
       *   Marek Kotewicz <marek@ethdev.com>
       *   Aaron Kumavis <aaron@kumavis.me>
       * @date 2015
       */

      "use strict";

      // Initialize Jsonrpc as a simple object with utility functions.

      var Jsonrpc = {
        messageId: 0
      };

      /**
       * Should be called to valid json create payload object
       *
       * @method toPayload
       * @param {Function} method of jsonrpc call, required
       * @param {Array} params, an array of method params, optional
       * @returns {Object} valid jsonrpc payload object
       */
      Jsonrpc.toPayload = function (method, params) {
        if (!method) {
          throw new Error('JSONRPC method should be specified for params: "' + JSON.stringify(params) + '"!');
        }

        // advance message ID
        Jsonrpc.messageId++;

        return {
          jsonrpc: '2.0',
          id: Jsonrpc.messageId,
          method: method,
          params: params || []
        };
      };

      /**
       * Should be called to check if jsonrpc response is valid
       *
       * @method isValidResponse
       * @param {Object}
       * @returns {Boolean} true if response is valid, otherwise false
       */
      Jsonrpc.isValidResponse = function (response) {
        return Array.isArray(response) ? response.every(validateSingleMessage) : validateSingleMessage(response);

        function validateSingleMessage(message) {
          return !!message && !message.error && message.jsonrpc === '2.0' && (typeof message.id === 'number' || typeof message.id === 'string') && message.result !== undefined; // only undefined is not valid json object
        }
      };

      /**
       * Should be called to create batch payload object
       *
       * @method toBatchPayload
       * @param {Array} messages, an array of objects with method (required) and params (optional) fields
       * @returns {Array} batch payload
       */
      Jsonrpc.toBatchPayload = function (messages) {
        return messages.map(function (message) {
          return Jsonrpc.toPayload(message.method, message.params);
        });
      };

      module.exports = Jsonrpc;
    }, {}], 77: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var Subscription = require('./subscription.js');

      var Subscriptions = function Subscriptions(options) {
        this.name = options.name;
        this.type = options.type;
        this.subscriptions = options.subscriptions || {};
        this.requestManager = null;
      };

      Subscriptions.prototype.setRequestManager = function (rm) {
        this.requestManager = rm;
      };

      Subscriptions.prototype.attachToObject = function (obj) {
        var func = this.buildCall();
        var name = this.name.split('.');
        if (name.length > 1) {
          obj[name[0]] = obj[name[0]] || {};
          obj[name[0]][name[1]] = func;
        } else {
          obj[name[0]] = func;
        }
      };

      Subscriptions.prototype.buildCall = function () {
        var _this = this;

        return function () {
          if (!_this.subscriptions[arguments[0]]) {
            console.warn('Subscription ' + JSON.stringify(arguments[0]) + ' doesn\'t exist. Subscribing anyway.');
          }

          var subscription = new Subscription({
            subscription: _this.subscriptions[arguments[0]],
            requestManager: _this.requestManager,
            type: _this.type
          });

          return subscription.subscribe.apply(subscription, arguments);
        };
      };

      module.exports = {
        subscriptions: Subscriptions,
        subscription: Subscription
      };
    }, { "./subscription.js": 78 }], 78: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file subscription.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var _ = require('underscore');
      var errors = require('../../web3-core-helpers').errors;
      var EventEmitter = require('eventemitter3');

      function Subscription(options) {
        EventEmitter.call(this);

        this.id = null;
        this.callback = _.identity;
        this.arguments = null;
        this._reconnectIntervalId = null;

        this.options = {
          subscription: options.subscription,
          type: options.type,
          requestManager: options.requestManager
        };
      }

      // INHERIT
      Subscription.prototype = Object.create(EventEmitter.prototype);
      Subscription.prototype.constructor = Subscription;

      /**
       * Should be used to extract callback from array of arguments. Modifies input param
       *
       * @method extractCallback
       * @param {Array} arguments
       * @return {Function|Null} callback, if exists
       */

      Subscription.prototype._extractCallback = function (args) {
        if (_.isFunction(args[args.length - 1])) {
          return args.pop(); // modify the args array!
        }
      };

      /**
       * Should be called to check if the number of arguments is correct
       *
       * @method validateArgs
       * @param {Array} arguments
       * @throws {Error} if it is not
       */

      Subscription.prototype._validateArgs = function (args) {
        var subscription = this.options.subscription;

        if (!subscription) subscription = {};

        if (!subscription.params) subscription.params = 0;

        if (args.length !== subscription.params) {
          throw errors.InvalidNumberOfParams(args.length, subscription.params + 1, args[0]);
        }
      };

      /**
       * Should be called to format input args of method
       *
       * @method formatInput
       * @param {Array}
       * @return {Array}
       */

      Subscription.prototype._formatInput = function (args) {
        var subscription = this.options.subscription;

        if (!subscription) {
          return args;
        }

        if (!subscription.inputFormatter) {
          return args;
        }

        var formattedArgs = subscription.inputFormatter.map(function (formatter, index) {
          return formatter ? formatter(args[index]) : args[index];
        });

        return formattedArgs;
      };

      /**
       * Should be called to format output(result) of method
       *
       * @method formatOutput
       * @param {Object}
       * @return {Object}
       */

      Subscription.prototype._formatOutput = function (result) {
        var subscription = this.options.subscription;

        return subscription && subscription.outputFormatter && result ? subscription.outputFormatter(result) : result;
      };

      /**
       * Should create payload from given input args
       *
       * @method toPayload
       * @param {Array} args
       * @return {Object}
       */
      Subscription.prototype._toPayload = function (args) {
        var params = [];
        this.callback = this._extractCallback(args) || _.identity;

        if (!this.subscriptionMethod) {
          this.subscriptionMethod = args.shift();

          // replace subscription with given name
          if (this.options.subscription.subscriptionName) {
            this.subscriptionMethod = this.options.subscription.subscriptionName;
          }
        }

        if (!this.arguments) {
          this.arguments = this._formatInput(args);
          this._validateArgs(this.arguments);
          args = []; // make empty after validation
        }

        // re-add subscriptionName
        params.push(this.subscriptionMethod);
        params = params.concat(this.arguments);

        if (args.length) {
          throw new Error('Only a callback is allowed as parameter on an already instantiated subscription.');
        }

        return {
          method: this.options.type + '_subscribe',
          params: params
        };
      };

      /**
       * Unsubscribes and clears callbacks
       *
       * @method unsubscribe
       * @return {Object}
       */
      Subscription.prototype.unsubscribe = function (callback) {
        this.options.requestManager.removeSubscription(this.id, callback);
        this.id = null;
        this.removeAllListeners();
        clearInterval(this._reconnectIntervalId);
      };

      /**
       * Subscribes and watches for changes
       *
       * @method subscribe
       * @param {String} subscription the subscription
       * @param {Object} options the options object with address topics and fromBlock
       * @return {Object}
       */
      Subscription.prototype.subscribe = function () {
        var _this = this;
        var args = Array.prototype.slice.call(arguments);
        var payload = this._toPayload(args);

        if (!payload) {
          return this;
        }

        if (!this.options.requestManager.provider) {
          var err1 = new Error('No provider set.');
          this.callback(err1, null, this);
          this.emit('error', err1);
          return this;
        }

        // throw error, if provider doesnt support subscriptions
        if (!this.options.requestManager.provider.on) {
          var err2 = new Error('The current provider doesn\'t support subscriptions: ' + this.options.requestManager.provider.constructor.name);
          this.callback(err2, null, this);
          this.emit('error', err2);
          return this;
        }

        // if id is there unsubscribe first
        if (this.id) {
          this.unsubscribe();
        }

        // store the params in the options object
        this.options.params = payload.params[1];

        // get past logs, if fromBlock is available
        if (payload.params[0] === 'logs' && _.isObject(payload.params[1]) && payload.params[1].hasOwnProperty('fromBlock') && isFinite(payload.params[1].fromBlock)) {
          // send the subscription request
          this.options.requestManager.send({
            method: 'eth_getLogs',
            params: [payload.params[1]]
          }, function (err, logs) {
            if (!err) {
              logs.forEach(function (log) {
                var output = _this._formatOutput(log);
                _this.callback(null, output, _this);
                _this.emit('data', output);
              });

              // TODO subscribe here? after the past logs?
            } else {
              _this.callback(err, null, _this);
              _this.emit('error', err);
            }
          });
        }

        // create subscription
        // TODO move to separate function? so that past logs can go first?

        if (_typeof(payload.params[1]) === 'object') delete payload.params[1].fromBlock;

        this.options.requestManager.send(payload, function (err, result) {
          if (!err && result) {
            _this.id = result;

            // call callback on notifications
            _this.options.requestManager.addSubscription(_this.id, payload.params[0], _this.options.type, function (err, result) {

              if (!err) {
                if (!_.isArray(result)) {
                  result = [result];
                }

                result.forEach(function (resultItem) {
                  var output = _this._formatOutput(resultItem);

                  if (_.isFunction(_this.options.subscription.subscriptionHandler)) {
                    return _this.options.subscription.subscriptionHandler.call(_this, output);
                  } else {
                    _this.emit('data', output);
                  }

                  // call the callback, last so that unsubscribe there won't affect the emit above
                  _this.callback(null, output, _this);
                });
              } else {
                // unsubscribe, but keep listeners
                _this.options.requestManager.removeSubscription(_this.id);

                // re-subscribe, if connection fails
                if (_this.options.requestManager.provider.once) {
                  _this._reconnectIntervalId = setInterval(function () {
                    // TODO check if that makes sense!
                    if (_this.options.requestManager.provider.reconnect) {
                      _this.options.requestManager.provider.reconnect();
                    }
                  }, 500);

                  _this.options.requestManager.provider.once('connect', function () {
                    clearInterval(_this._reconnectIntervalId);
                    _this.subscribe(_this.callback);
                  });
                }
                _this.emit('error', err);

                // call the callback, last so that unsubscribe there won't affect the emit above
                _this.callback(err, null, _this);
              }
            });
          } else {
            _this.callback(err, null, _this);
            _this.emit('error', err);
          }
        });

        // return an object to cancel the subscription
        return this;
      };

      module.exports = Subscription;
    }, { "../../web3-core-helpers": 70, "eventemitter3": 14, "underscore": 53 }], 79: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file extend.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var formatters = require('../../web3-core-helpers').formatters;
      var Method = require('../../web3-core-method');
      var utils = require('../../web3-utils');

      var extend = function extend(pckg) {
        /* jshint maxcomplexity:5 */
        var ex = function ex(extension) {

          var extendedObject;
          if (extension.property) {
            if (!pckg[extension.property]) {
              pckg[extension.property] = {};
            }
            extendedObject = pckg[extension.property];
          } else {
            extendedObject = pckg;
          }

          if (extension.methods) {
            extension.methods.forEach(function (method) {
              if (!(method instanceof Method)) {
                method = new Method(method);
              }

              method.attachToObject(extendedObject);
              method.setRequestManager(pckg._requestManager);
            });
          }

          return pckg;
        };

        ex.formatters = formatters;
        ex.utils = utils;
        ex.Method = Method;

        return ex;
      };

      module.exports = extend;
    }, { "../../web3-core-helpers": 70, "../../web3-core-method": 71, "../../web3-utils": 86 }], 80: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var requestManager = require('../../web3-core-requestmanager');
      var extend = require('./extend.js');

      module.exports = {
        packageInit: function packageInit(pkg, args) {
          args = Array.prototype.slice.call(args);

          if (!pkg) {
            throw new Error('You need to instantiate using the "new" keyword.');
          }

          // make property of pkg._provider, which can properly set providers
          Object.defineProperty(pkg, 'currentProvider', {
            get: function get() {
              return pkg._provider;
            },
            set: function set(value) {
              return pkg.setProvider(value);
            },
            enumerable: true,
            configurable: true
          });

          // inherit from web3 umbrella package
          if (args[0] && args[0]._requestManager) {
            pkg._requestManager = new requestManager.Manager(args[0].currentProvider);

            // set requestmanager on package
          } else {
            pkg._requestManager = new requestManager.Manager();
            pkg._requestManager.setProvider(args[0], args[1]);
          }

          // add givenProvider
          pkg.givenProvider = requestManager.Manager.givenProvider;
          pkg.providers = requestManager.Manager.providers;

          pkg._provider = pkg._requestManager.provider;

          // add SETPROVIDER function (don't overwrite if already existing)
          if (!pkg.setProvider) {
            pkg.setProvider = function (provider, net) {
              pkg._requestManager.setProvider(provider, net);
              pkg._provider = pkg._requestManager.provider;
              return true;
            };
          }

          // attach batch request creation
          pkg.BatchRequest = requestManager.BatchManager.bind(null, pkg._requestManager);

          // attach extend function
          pkg.extend = extend(pkg);
        },
        addProviders: function addProviders(pkg) {
          pkg.givenProvider = requestManager.Manager.givenProvider;
          pkg.providers = requestManager.Manager.providers;
        }
      };
    }, { "../../web3-core-requestmanager": 75, "./extend.js": 79 }], 81: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file iban.js
       *
       * Details: https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol
       *
       * @author Marek Kotewicz <marek@parity.io>
       * @date 2015
       */

      "use strict";

      var utils = require('../../web3-utils');
      var BigNumber = require('bn.js');

      var leftPad = function leftPad(string, bytes) {
        var result = string;
        while (result.length < bytes * 2) {
          result = '0' + result;
        }
        return result;
      };

      /**
       * Prepare an IBAN for mod 97 computation by moving the first 4 chars to the end and transforming the letters to
       * numbers (A = 10, B = 11, ..., Z = 35), as specified in ISO13616.
       *
       * @method iso13616Prepare
       * @param {String} iban the IBAN
       * @returns {String} the prepared IBAN
       */
      var iso13616Prepare = function iso13616Prepare(iban) {
        var A = 'A'.charCodeAt(0);
        var Z = 'Z'.charCodeAt(0);

        iban = iban.toUpperCase();
        iban = iban.substr(4) + iban.substr(0, 4);

        return iban.split('').map(function (n) {
          var code = n.charCodeAt(0);
          if (code >= A && code <= Z) {
            // A = 10, B = 11, ... Z = 35
            return code - A + 10;
          } else {
            return n;
          }
        }).join('');
      };

      /**
       * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
       *
       * @method mod9710
       * @param {String} iban
       * @returns {Number}
       */
      var mod9710 = function mod9710(iban) {
        var remainder = iban,
            block;

        while (remainder.length > 2) {
          block = remainder.slice(0, 9);
          remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
        }

        return parseInt(remainder, 10) % 97;
      };

      /**
       * This prototype should be used to create iban object from iban correct string
       *
       * @param {String} iban
       */
      var Iban = function Iban(iban) {
        this._iban = iban;
      };

      /**
       * This method should be used to create an ethereum address from a direct iban address
       *
       * @method toAddress
       * @param {String} iban address
       * @return {String} the ethereum address
       */
      Iban.toAddress = function (ib) {
        ib = new Iban(ib);

        if (!ib.isDirect()) {
          throw new Error('IBAN is indirect and can\'t be converted');
        }

        return ib.toAddress();
      };

      /**
       * This method should be used to create iban address from an ethereum address
       *
       * @method toIban
       * @param {String} address
       * @return {String} the IBAN address
       */
      Iban.toIban = function (address) {
        return Iban.fromAddress(address).toString();
      };

      /**
       * This method should be used to create iban object from an ethereum address
       *
       * @method fromAddress
       * @param {String} address
       * @return {Iban} the IBAN object
       */
      Iban.fromAddress = function (address) {
        if (!utils.isAddress(address)) {
          throw new Error('Provided address is not a valid address: ' + address);
        }

        address = address.replace('0x', '').replace('0X', '');

        var asBn = new BigNumber(address, 16);
        var base36 = asBn.toString(36);
        var padded = leftPad(base36, 15);
        return Iban.fromBban(padded.toUpperCase());
      };

      /**
       * Convert the passed BBAN to an IBAN for this country specification.
       * Please note that <i>"generation of the IBAN shall be the exclusive responsibility of the bank/branch servicing the account"</i>.
       * This method implements the preferred algorithm described in http://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits
       *
       * @method fromBban
       * @param {String} bban the BBAN to convert to IBAN
       * @returns {Iban} the IBAN object
       */
      Iban.fromBban = function (bban) {
        var countryCode = 'XE';

        var remainder = mod9710(iso13616Prepare(countryCode + '00' + bban));
        var checkDigit = ('0' + (98 - remainder)).slice(-2);

        return new Iban(countryCode + checkDigit + bban);
      };

      /**
       * Should be used to create IBAN object for given institution and identifier
       *
       * @method createIndirect
       * @param {Object} options, required options are "institution" and "identifier"
       * @return {Iban} the IBAN object
       */
      Iban.createIndirect = function (options) {
        return Iban.fromBban('ETH' + options.institution + options.identifier);
      };

      /**
       * This method should be used to check if given string is valid iban object
       *
       * @method isValid
       * @param {String} iban string
       * @return {Boolean} true if it is valid IBAN
       */
      Iban.isValid = function (iban) {
        var i = new Iban(iban);
        return i.isValid();
      };

      /**
       * Should be called to check if iban is correct
       *
       * @method isValid
       * @returns {Boolean} true if it is, otherwise false
       */
      Iban.prototype.isValid = function () {
        return (/^XE[0-9]{2}(ETH[0-9A-Z]{13}|[0-9A-Z]{30,31})$/.test(this._iban) && mod9710(iso13616Prepare(this._iban)) === 1
        );
      };

      /**
       * Should be called to check if iban number is direct
       *
       * @method isDirect
       * @returns {Boolean} true if it is, otherwise false
       */
      Iban.prototype.isDirect = function () {
        return this._iban.length === 34 || this._iban.length === 35;
      };

      /**
       * Should be called to check if iban number if indirect
       *
       * @method isIndirect
       * @returns {Boolean} true if it is, otherwise false
       */
      Iban.prototype.isIndirect = function () {
        return this._iban.length === 20;
      };

      /**
       * Should be called to get iban checksum
       * Uses the mod-97-10 checksumming protocol (ISO/IEC 7064:2003)
       *
       * @method checksum
       * @returns {String} checksum
       */
      Iban.prototype.checksum = function () {
        return this._iban.substr(2, 2);
      };

      /**
       * Should be called to get institution identifier
       * eg. XREG
       *
       * @method institution
       * @returns {String} institution identifier
       */
      Iban.prototype.institution = function () {
        return this.isIndirect() ? this._iban.substr(7, 4) : '';
      };

      /**
       * Should be called to get client identifier within institution
       * eg. GAVOFYORK
       *
       * @method client
       * @returns {String} client identifier
       */
      Iban.prototype.client = function () {
        return this.isIndirect() ? this._iban.substr(11) : '';
      };

      /**
       * Should be called to get client direct address
       *
       * @method toAddress
       * @returns {String} ethereum address
       */
      Iban.prototype.toAddress = function () {
        if (this.isDirect()) {
          var base36 = this._iban.substr(4);
          var asBn = new BigNumber(base36, 36);
          return utils.toChecksumAddress(asBn.toString(16, 20));
        }

        return '';
      };

      Iban.prototype.toString = function () {
        return this._iban;
      };

      module.exports = Iban;
    }, { "../../web3-utils": 86, "bn.js": "BN" }], 82: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var core = require('../../web3-core');
      var Method = require('../../web3-core-method');
      var utils = require('../../web3-utils');

      var Net = function Net() {
        var _this = this;

        // sets _requestmanager
        core.packageInit(this, arguments);

        [new Method({
          name: 'getId',
          call: 'net_version',
          params: 0,
          outputFormatter: utils.hexToNumber
        }), new Method({
          name: 'isListening',
          call: 'net_listening',
          params: 0
        }), new Method({
          name: 'getPeerCount',
          call: 'net_peerCount',
          params: 0,
          outputFormatter: utils.hexToNumber
        })].forEach(function (method) {
          method.attachToObject(_this);
          method.setRequestManager(_this._requestManager);
        });
      };

      core.addProviders(Net);

      module.exports = Net;
    }, { "../../web3-core": 80, "../../web3-core-method": 71, "../../web3-utils": 86 }], 83: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /** @file httpprovider.js
       * @authors:
       *   Marek Kotewicz <marek@parity.io>
       *   Marian Oancea
       *   Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2015
       */

      var errors = require('../../web3-core-helpers').errors;
      var XHR2 = require('xhr2-cookies').XMLHttpRequest; // jshint ignore: line
      var http = require('http');
      var https = require('https');

      /**
       * HttpProvider should be used to send rpc calls over http
       */
      var HttpProvider = function HttpProvider(host, options) {
        options = options || {};
        this.host = host || 'http://localhost:8545';
        if (this.host.substring(0, 5) === "https") {
          this.httpsAgent = new https.Agent({ keepAlive: true });
        } else {
          this.httpAgent = new http.Agent({ keepAlive: true });
        }
        this.timeout = options.timeout || 0;
        this.headers = options.headers;
        this.connected = false;
      };

      HttpProvider.prototype._prepareRequest = function () {
        var request = new XHR2();
        request.nodejsSet({
          httpsAgent: this.httpsAgent,
          httpAgent: this.httpAgent
        });

        request.open('POST', this.host, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0;
        request.withCredentials = true;

        if (this.headers) {
          this.headers.forEach(function (header) {
            request.setRequestHeader(header.name, header.value);
          });
        }

        return request;
      };

      /**
       * Should be used to make async request
       *
       * @method send
       * @param {Object} payload
       * @param {Function} callback triggered on end with (err, result)
       */
      HttpProvider.prototype.send = function (payload, callback) {
        var _this = this;
        var request = this._prepareRequest();

        request.onreadystatechange = function () {
          if (request.readyState === 4 && request.timeout !== 1) {
            var result = request.responseText;
            var error = null;

            try {
              result = JSON.parse(result);
            } catch (e) {
              error = errors.InvalidResponse(request.responseText);
            }

            _this.connected = true;
            callback(error, result);
          }
        };

        request.ontimeout = function () {
          _this.connected = false;
          callback(errors.ConnectionTimeout(this.timeout));
        };

        try {
          request.send(JSON.stringify(payload));
        } catch (error) {
          this.connected = false;
          callback(errors.InvalidConnection(this.host));
        }
      };

      HttpProvider.prototype.disconnect = function () {
        //NO OP
      };

      module.exports = HttpProvider;
    }, { "../../web3-core-helpers": 70, "http": 46, "https": 16, "xhr2-cookies": 62 }], 84: [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /** @file index.js
       * @authors:
       *   Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var _ = require('underscore');
      var errors = require('../../web3-core-helpers').errors;
      var oboe = require('oboe');

      var IpcProvider = function IpcProvider(path, net) {
        var _this = this;
        this.responseCallbacks = {};
        this.notificationCallbacks = [];
        this.path = path;
        this.connected = false;

        this.connection = net.connect({ path: this.path });

        this.addDefaultEvents();

        // LISTEN FOR CONNECTION RESPONSES
        var callback = function callback(result) {
          /*jshint maxcomplexity: 6 */

          var id = null;

          // get the id which matches the returned id
          if (_.isArray(result)) {
            result.forEach(function (load) {
              if (_this.responseCallbacks[load.id]) id = load.id;
            });
          } else {
            id = result.id;
          }

          // notification
          if (!id && result.method.indexOf('_subscription') !== -1) {
            _this.notificationCallbacks.forEach(function (callback) {
              if (_.isFunction(callback)) callback(result);
            });

            // fire the callback
          } else if (_this.responseCallbacks[id]) {
            _this.responseCallbacks[id](null, result);
            delete _this.responseCallbacks[id];
          }
        };

        // use oboe.js for Sockets
        if (net.constructor.name === 'Socket') {
          oboe(this.connection).done(callback);
        } else {
          this.connection.on('data', function (data) {
            _this._parseResponse(data.toString()).forEach(callback);
          });
        }
      };

      /**
      Will add the error and end event to timeout existing calls
      
      @method addDefaultEvents
      */
      IpcProvider.prototype.addDefaultEvents = function () {
        var _this = this;

        this.connection.on('connect', function () {
          _this.connected = true;
        });

        this.connection.on('close', function () {
          _this.connected = false;
        });

        this.connection.on('error', function () {
          _this._timeout();
        });

        this.connection.on('end', function () {
          _this._timeout();
        });

        this.connection.on('timeout', function () {
          _this._timeout();
        });
      };

      /**
       Will parse the response and make an array out of it.
      
       NOTE, this exists for backwards compatibility reasons.
      
       @method _parseResponse
       @param {String} data
       */
      IpcProvider.prototype._parseResponse = function (data) {
        var _this = this,
            returnValues = [];

        // DE-CHUNKER
        var dechunkedData = data.replace(/\}[\n\r]?\{/g, '}|--|{') // }{
        .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
        .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
        .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
        .split('|--|');

        dechunkedData.forEach(function (data) {

          // prepend the last chunk
          if (_this.lastChunk) data = _this.lastChunk + data;

          var result = null;

          try {
            result = JSON.parse(data);
          } catch (e) {

            _this.lastChunk = data;

            // start timeout to cancel all requests
            clearTimeout(_this.lastChunkTimeout);
            _this.lastChunkTimeout = setTimeout(function () {
              _this._timeout();
              throw errors.InvalidResponse(data);
            }, 1000 * 15);

            return;
          }

          // cancel timeout and set chunk to null
          clearTimeout(_this.lastChunkTimeout);
          _this.lastChunk = null;

          if (result) returnValues.push(result);
        });

        return returnValues;
      };

      /**
      Get the adds a callback to the responseCallbacks object,
      which will be called if a response matching the response Id will arrive.
      
      @method _addResponseCallback
      */
      IpcProvider.prototype._addResponseCallback = function (payload, callback) {
        var id = payload.id || payload[0].id;
        var method = payload.method || payload[0].method;

        this.responseCallbacks[id] = callback;
        this.responseCallbacks[id].method = method;
      };

      /**
      Timeout all requests when the end/error event is fired
      
      @method _timeout
      */
      IpcProvider.prototype._timeout = function () {
        for (var key in this.responseCallbacks) {
          if (this.responseCallbacks.hasOwnProperty(key)) {
            this.responseCallbacks[key](errors.InvalidConnection('on IPC'));
            delete this.responseCallbacks[key];
          }
        }
      };

      /**
       Try to reconnect
      
       @method reconnect
       */
      IpcProvider.prototype.reconnect = function () {
        this.connection.connect({ path: this.path });
      };

      IpcProvider.prototype.send = function (payload, callback) {
        // try reconnect, when connection is gone
        if (!this.connection.writable) this.connection.connect({ path: this.path });

        this.connection.write(JSON.stringify(payload));
        this._addResponseCallback(payload, callback);
      };

      /**
      Subscribes to provider events.provider
      
      @method on
      @param {String} type    'notification', 'connect', 'error', 'end' or 'data'
      @param {Function} callback   the callback to call
      */
      IpcProvider.prototype.on = function (type, callback) {

        if (typeof callback !== 'function') throw new Error('The second parameter callback must be a function.');

        switch (type) {
          case 'data':
            this.notificationCallbacks.push(callback);
            break;

          // adds error, end, timeout, connect
          default:
            this.connection.on(type, callback);
            break;
        }
      };

      /**
       Subscribes to provider events.provider
      
       @method on
       @param {String} type    'connect', 'error', 'end' or 'data'
       @param {Function} callback   the callback to call
       */
      IpcProvider.prototype.once = function (type, callback) {

        if (typeof callback !== 'function') throw new Error('The second parameter callback must be a function.');

        this.connection.once(type, callback);
      };

      /**
      Removes event listener
      
      @method removeListener
      @param {String} type    'data', 'connect', 'error', 'end' or 'data'
      @param {Function} callback   the callback to call
      */
      IpcProvider.prototype.removeListener = function (type, callback) {
        var _this = this;

        switch (type) {
          case 'data':
            this.notificationCallbacks.forEach(function (cb, index) {
              if (cb === callback) _this.notificationCallbacks.splice(index, 1);
            });
            break;

          default:
            this.connection.removeListener(type, callback);
            break;
        }
      };

      /**
      Removes all event listeners
      
      @method removeAllListeners
      @param {String} type    'data', 'connect', 'error', 'end' or 'data'
      */
      IpcProvider.prototype.removeAllListeners = function (type) {
        switch (type) {
          case 'data':
            this.notificationCallbacks = [];
            break;

          default:
            this.connection.removeAllListeners(type);
            break;
        }
      };

      /**
      Resets the providers, clears all callbacks
      
      @method reset
      */
      IpcProvider.prototype.reset = function () {
        this._timeout();
        this.notificationCallbacks = [];

        this.connection.removeAllListeners('error');
        this.connection.removeAllListeners('end');
        this.connection.removeAllListeners('timeout');

        this.addDefaultEvents();
      };

      module.exports = IpcProvider;
    }, { "../../web3-core-helpers": 70, "oboe": 24, "underscore": 53 }], 85: [function (require, module, exports) {
      (function (Buffer) {
        /*
         This file is part of web3.js.
        
         web3.js is free software: you can redistribute it and/or modify
         it under the terms of the GNU Lesser General Public License as published by
         the Free Software Foundation, either version 3 of the License, or
         (at your option) any later version.
        
         web3.js is distributed in the hope that it will be useful,
         but WITHOUT ANY WARRANTY; without even the implied warranty of
         MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
         GNU Lesser General Public License for more details.
        
         You should have received a copy of the GNU Lesser General Public License
         along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
         */
        /** @file WebsocketProvider.js
         * @authors:
         *   Fabian Vogelsteller <fabian@ethereum.org>
         * @date 2017
         */

        "use strict";

        var _ = require('underscore');
        var errors = require('../../web3-core-helpers').errors;

        var Ws = null;
        var _btoa = null;
        var parseURL = null;
        if (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined') {
          Ws = function Ws(url, protocols) {
            return new window.WebSocket(url, protocols);
          };
          _btoa = btoa;
          parseURL = function parseURL(url) {
            return new URL(url);
          };
        } else {
          Ws = require('websocket').w3cwebsocket;
          _btoa = function _btoa(str) {
            return Buffer(str).toString('base64');
          };
          var url = require('url');
          if (url.URL) {
            // Use the new Node 6+ API for parsing URLs that supports username/password
            var newURL = url.URL;
            parseURL = function parseURL(url) {
              return new newURL(url);
            };
          } else {
            // Web3 supports Node.js 5, so fall back to the legacy URL API if necessary
            parseURL = require('url').parse;
          }
        }
        // Default connection ws://localhost:8546


        var WebsocketProvider = function WebsocketProvider(url, options) {
          var _this = this;
          this.responseCallbacks = {};
          this.notificationCallbacks = [];

          options = options || {};
          this._customTimeout = options.timeout;

          // The w3cwebsocket implementation does not support Basic Auth
          // username/password in the URL. So generate the basic auth header, and
          // pass through with any additional headers supplied in constructor
          var parsedURL = parseURL(url);
          var headers = options.headers || {};
          var protocol = options.protocol || undefined;
          if (parsedURL.username && parsedURL.password) {
            headers.authorization = 'Basic ' + _btoa(parsedURL.username + ':' + parsedURL.password);
          }

          // Allow a custom client configuration
          var clientConfig = options.clientConfig || undefined;

          // When all node core implementations that do not have the
          // WHATWG compatible URL parser go out of service this line can be removed.
          if (parsedURL.auth) {
            headers.authorization = 'Basic ' + _btoa(parsedURL.auth);
          }
          this.connection = new Ws(url, protocol, undefined, headers, undefined, clientConfig);

          this.addDefaultEvents();

          // LISTEN FOR CONNECTION RESPONSES
          this.connection.onmessage = function (e) {
            /*jshint maxcomplexity: 6 */
            var data = typeof e.data === 'string' ? e.data : '';

            _this._parseResponse(data).forEach(function (result) {

              var id = null;

              // get the id which matches the returned id
              if (_.isArray(result)) {
                result.forEach(function (load) {
                  if (_this.responseCallbacks[load.id]) id = load.id;
                });
              } else {
                id = result.id;
              }

              // notification
              if (!id && result && result.method && result.method.indexOf('_subscription') !== -1) {
                _this.notificationCallbacks.forEach(function (callback) {
                  if (_.isFunction(callback)) callback(result);
                });

                // fire the callback
              } else if (_this.responseCallbacks[id]) {
                _this.responseCallbacks[id](null, result);
                delete _this.responseCallbacks[id];
              }
            });
          };

          // make property `connected` which will return the current connection status
          Object.defineProperty(this, 'connected', {
            get: function get() {
              return this.connection && this.connection.readyState === this.connection.OPEN;
            },
            enumerable: true
          });
        };

        /**
         Will add the error and end event to timeout existing calls
        
         @method addDefaultEvents
         */
        WebsocketProvider.prototype.addDefaultEvents = function () {
          var _this = this;

          this.connection.onerror = function () {
            _this._timeout();
          };

          this.connection.onclose = function () {
            _this._timeout();

            // reset all requests and callbacks
            _this.reset();
          };

          // this.connection.on('timeout', function(){
          //     _this._timeout();
          // });
        };

        /**
         Will parse the response and make an array out of it.
        
         @method _parseResponse
         @param {String} data
         */
        WebsocketProvider.prototype._parseResponse = function (data) {
          var _this = this,
              returnValues = [];

          // DE-CHUNKER
          var dechunkedData = data.replace(/\}[\n\r]?\{/g, '}|--|{') // }{
          .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
          .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
          .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
          .split('|--|');

          dechunkedData.forEach(function (data) {

            // prepend the last chunk
            if (_this.lastChunk) data = _this.lastChunk + data;

            var result = null;

            try {
              result = JSON.parse(data);
            } catch (e) {

              _this.lastChunk = data;

              // start timeout to cancel all requests
              clearTimeout(_this.lastChunkTimeout);
              _this.lastChunkTimeout = setTimeout(function () {
                _this._timeout();
                throw errors.InvalidResponse(data);
              }, 1000 * 15);

              return;
            }

            // cancel timeout and set chunk to null
            clearTimeout(_this.lastChunkTimeout);
            _this.lastChunk = null;

            if (result) returnValues.push(result);
          });

          return returnValues;
        };

        /**
         Adds a callback to the responseCallbacks object,
         which will be called if a response matching the response Id will arrive.
        
         @method _addResponseCallback
         */
        WebsocketProvider.prototype._addResponseCallback = function (payload, callback) {
          var id = payload.id || payload[0].id;
          var method = payload.method || payload[0].method;

          this.responseCallbacks[id] = callback;
          this.responseCallbacks[id].method = method;

          var _this = this;

          // schedule triggering the error response if a custom timeout is set
          if (this._customTimeout) {
            setTimeout(function () {
              if (_this.responseCallbacks[id]) {
                _this.responseCallbacks[id](errors.ConnectionTimeout(_this._customTimeout));
                delete _this.responseCallbacks[id];
              }
            }, this._customTimeout);
          }
        };

        /**
         Timeout all requests when the end/error event is fired
        
         @method _timeout
         */
        WebsocketProvider.prototype._timeout = function () {
          for (var key in this.responseCallbacks) {
            if (this.responseCallbacks.hasOwnProperty(key)) {
              this.responseCallbacks[key](errors.InvalidConnection('on WS'));
              delete this.responseCallbacks[key];
            }
          }
        };

        WebsocketProvider.prototype.send = function (payload, callback) {
          var _this = this;

          if (this.connection.readyState === this.connection.CONNECTING) {
            setTimeout(function () {
              _this.send(payload, callback);
            }, 10);
            return;
          }

          // try reconnect, when connection is gone
          // if(!this.connection.writable)
          //     this.connection.connect({url: this.url});
          if (this.connection.readyState !== this.connection.OPEN) {
            console.error('connection not open on send()');
            if (typeof this.connection.onerror === 'function') {
              this.connection.onerror(new Error('connection not open'));
            } else {
              console.error('no error callback');
            }
            callback(new Error('connection not open'));
            return;
          }

          this.connection.send(JSON.stringify(payload));
          this._addResponseCallback(payload, callback);
        };

        /**
         Subscribes to provider events.provider
        
         @method on
         @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
         @param {Function} callback   the callback to call
         */
        WebsocketProvider.prototype.on = function (type, callback) {

          if (typeof callback !== 'function') throw new Error('The second parameter callback must be a function.');

          switch (type) {
            case 'data':
              this.notificationCallbacks.push(callback);
              break;

            case 'connect':
              this.connection.onopen = callback;
              break;

            case 'end':
              this.connection.onclose = callback;
              break;

            case 'error':
              this.connection.onerror = callback;
              break;

            // default:
            //     this.connection.on(type, callback);
            //     break;
          }
        };

        // TODO add once

        /**
         Removes event listener
        
         @method removeListener
         @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
         @param {Function} callback   the callback to call
         */
        WebsocketProvider.prototype.removeListener = function (type, callback) {
          var _this = this;

          switch (type) {
            case 'data':
              this.notificationCallbacks.forEach(function (cb, index) {
                if (cb === callback) _this.notificationCallbacks.splice(index, 1);
              });
              break;

            // TODO remvoving connect missing

            // default:
            //     this.connection.removeListener(type, callback);
            //     break;
          }
        };

        /**
         Removes all event listeners
        
         @method removeAllListeners
         @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
         */
        WebsocketProvider.prototype.removeAllListeners = function (type) {
          switch (type) {
            case 'data':
              this.notificationCallbacks = [];
              break;

            // TODO remvoving connect properly missing

            case 'connect':
              this.connection.onopen = null;
              break;

            case 'end':
              this.connection.onclose = null;
              break;

            case 'error':
              this.connection.onerror = null;
              break;

            default:
              // this.connection.removeAllListeners(type);
              break;
          }
        };

        /**
         Resets the providers, clears all callbacks
        
         @method reset
         */
        WebsocketProvider.prototype.reset = function () {
          this._timeout();
          this.notificationCallbacks = [];

          // this.connection.removeAllListeners('error');
          // this.connection.removeAllListeners('end');
          // this.connection.removeAllListeners('timeout');

          this.addDefaultEvents();
        };

        WebsocketProvider.prototype.disconnect = function () {
          if (this.connection) {
            this.connection.close();
          }
        };

        module.exports = WebsocketProvider;
      }).call(this, require("buffer").Buffer);
    }, { "../../web3-core-helpers": 70, "buffer": 6, "underscore": 53, "url": 54, "websocket": 58 }], 86: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file utils.js
       * @author Marek Kotewicz <marek@parity.io>
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      var _ = require('underscore');
      var ethjsUnit = require('ethjs-unit');
      var utils = require('./utils.js');
      var soliditySha3 = require('./soliditySha3.js');
      var randomHex = require('randomhex');

      /**
       * Fires an error in an event emitter and callback and returns the eventemitter
       *
       * @method _fireError
       * @param {Object} error a string, a error, or an object with {message, data}
       * @param {Object} emitter
       * @param {Function} reject
       * @param {Function} callback
       * @return {Object} the emitter
       */
      var _fireError = function _fireError(error, emitter, reject, callback) {
        /*jshint maxcomplexity: 10 */

        // add data if given
        if (_.isObject(error) && !(error instanceof Error) && error.data) {
          if (_.isObject(error.data) || _.isArray(error.data)) {
            error.data = JSON.stringify(error.data, null, 2);
          }

          error = error.message + "\n" + error.data;
        }

        if (_.isString(error)) {
          error = new Error(error);
        }

        if (_.isFunction(callback)) {
          callback(error);
        }
        if (_.isFunction(reject)) {
          // suppress uncatched error if an error listener is present
          // OR suppress uncatched error if an callback listener is present
          if (emitter && _.isFunction(emitter.listeners) && emitter.listeners('error').length || _.isFunction(callback)) {
            emitter.catch(function () {});
          }
          // reject later, to be able to return emitter
          setTimeout(function () {
            reject(error);
          }, 1);
        }

        if (emitter && _.isFunction(emitter.emit)) {
          // emit later, to be able to return emitter
          setTimeout(function () {
            emitter.emit('error', error);
            emitter.removeAllListeners();
          }, 1);
        }

        return emitter;
      };

      /**
       * Should be used to create full function/event name from json abi
       *
       * @method _jsonInterfaceMethodToString
       * @param {Object} json
       * @return {String} full function/event name
       */
      var _jsonInterfaceMethodToString = function _jsonInterfaceMethodToString(json) {
        if (_.isObject(json) && json.name && json.name.indexOf('(') !== -1) {
          return json.name;
        }

        return json.name + '(' + _flattenTypes(false, json.inputs).join(',') + ')';
      };

      /**
       * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
       *
       * @method _flattenTypes
       * @param {bool} includeTuple
       * @param {Object} puts
       * @return {Array} parameters as strings
       */
      var _flattenTypes = function _flattenTypes(includeTuple, puts) {
        // console.log("entered _flattenTypes. inputs/outputs: " + puts)
        var types = [];

        puts.forEach(function (param) {
          if (_typeof(param.components) === 'object') {
            if (param.type.substring(0, 5) !== 'tuple') {
              throw new Error('components found but type is not tuple; report on GitHub');
            }
            var suffix = '';
            var arrayBracket = param.type.indexOf('[');
            if (arrayBracket >= 0) {
              suffix = param.type.substring(arrayBracket);
            }
            var result = _flattenTypes(includeTuple, param.components);
            // console.log("result should have things: " + result)
            if (_.isArray(result) && includeTuple) {
              // console.log("include tuple word, and its an array. joining...: " + result.types)
              types.push('tuple(' + result.join(',') + ')' + suffix);
            } else if (!includeTuple) {
              // console.log("don't include tuple, but its an array. joining...: " + result)
              types.push('(' + result.join(',') + ')' + suffix);
            } else {
              // console.log("its a single type within a tuple: " + result.types)
              types.push('(' + result + ')');
            }
          } else {
            // console.log("its a type and not directly in a tuple: " + param.type)
            types.push(param.type);
          }
        });

        return types;
      };

      /**
       * Should be called to get ascii from it's hex representation
       *
       * @method hexToAscii
       * @param {String} hex
       * @returns {String} ascii string representation of hex value
       */
      var hexToAscii = function hexToAscii(hex) {
        if (!utils.isHexStrict(hex)) throw new Error('The parameter must be a valid HEX string.');

        var str = "";
        var i = 0,
            l = hex.length;
        if (hex.substring(0, 2) === '0x') {
          i = 2;
        }
        for (; i < l; i += 2) {
          var code = parseInt(hex.substr(i, 2), 16);
          str += String.fromCharCode(code);
        }

        return str;
      };

      /**
       * Should be called to get hex representation (prefixed by 0x) of ascii string
       *
       * @method asciiToHex
       * @param {String} str
       * @returns {String} hex representation of input string
       */
      var asciiToHex = function asciiToHex(str) {
        if (!str) return "0x00";
        var hex = "";
        for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);
          var n = code.toString(16);
          hex += n.length < 2 ? '0' + n : n;
        }

        return "0x" + hex;
      };

      /**
       * Returns value of unit in Wei
       *
       * @method getUnitValue
       * @param {String} unit the unit to convert to, default ether
       * @returns {BN} value of the unit (in Wei)
       * @throws error if the unit is not correct:w
       */
      var getUnitValue = function getUnitValue(unit) {
        unit = unit ? unit.toLowerCase() : 'ether';
        if (!ethjsUnit.unitMap[unit]) {
          throw new Error('This unit "' + unit + '" doesn\'t exist, please use the one of the following units' + JSON.stringify(ethjsUnit.unitMap, null, 2));
        }
        return unit;
      };

      /**
       * Takes a number of wei and converts it to any other ether unit.
       *
       * Possible units are:
       *   SI Short   SI Full        Effigy       Other
       * - kwei       femtoether     babbage
       * - mwei       picoether      lovelace
       * - gwei       nanoether      shannon      nano
       * - --         microether     szabo        micro
       * - --         milliether     finney       milli
       * - ether      --             --
       * - kether                    --           grand
       * - mether
       * - gether
       * - tether
       *
       * @method fromWei
       * @param {Number|String} number can be a number, number string or a HEX of a decimal
       * @param {String} unit the unit to convert to, default ether
       * @return {String|Object} When given a BN object it returns one as well, otherwise a number
       */
      var fromWei = function fromWei(number, unit) {
        unit = getUnitValue(unit);

        if (!utils.isBN(number) && !_.isString(number)) {
          throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
        }

        return utils.isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10);
      };

      /**
       * Takes a number of a unit and converts it to wei.
       *
       * Possible units are:
       *   SI Short   SI Full        Effigy       Other
       * - kwei       femtoether     babbage
       * - mwei       picoether      lovelace
       * - gwei       nanoether      shannon      nano
       * - --         microether     szabo        micro
       * - --         microether     szabo        micro
       * - --         milliether     finney       milli
       * - ether      --             --
       * - kether                    --           grand
       * - mether
       * - gether
       * - tether
       *
       * @method toWei
       * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
       * @param {String} unit the unit to convert from, default ether
       * @return {String|Object} When given a BN object it returns one as well, otherwise a number
       */
      var toWei = function toWei(number, unit) {
        unit = getUnitValue(unit);

        if (!utils.isBN(number) && !_.isString(number)) {
          throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
        }

        return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10);
      };

      /**
       * Converts to a checksum address
       *
       * @method toChecksumAddress
       * @param {String} address the given HEX address
       * @return {String}
       */
      var toChecksumAddress = function toChecksumAddress(address) {
        if (typeof address === 'undefined') return '';

        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) throw new Error('Given address "' + address + '" is not a valid Ethereum address.');

        address = address.toLowerCase().replace(/^0x/i, '');
        var addressHash = utils.sha3(address).replace(/^0x/i, '');
        var checksumAddress = '0x';

        for (var i = 0; i < address.length; i++) {
          // If ith character is 9 to f then make it uppercase
          if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase();
          } else {
            checksumAddress += address[i];
          }
        }
        return checksumAddress;
      };

      module.exports = {
        _fireError: _fireError,
        _jsonInterfaceMethodToString: _jsonInterfaceMethodToString,
        _flattenTypes: _flattenTypes,
        // extractDisplayName: extractDisplayName,
        // extractTypeName: extractTypeName,
        randomHex: randomHex,
        _: _,
        BN: utils.BN,
        isBN: utils.isBN,
        isBigNumber: utils.isBigNumber,
        isHex: utils.isHex,
        isHexStrict: utils.isHexStrict,
        sha3: utils.sha3,
        keccak256: utils.sha3,
        soliditySha3: soliditySha3,
        isAddress: utils.isAddress,
        checkAddressChecksum: utils.checkAddressChecksum,
        toChecksumAddress: toChecksumAddress,
        toHex: utils.toHex,
        toBN: utils.toBN,

        bytesToHex: utils.bytesToHex,
        hexToBytes: utils.hexToBytes,

        hexToNumberString: utils.hexToNumberString,

        hexToNumber: utils.hexToNumber,
        toDecimal: utils.hexToNumber, // alias

        numberToHex: utils.numberToHex,
        fromDecimal: utils.numberToHex, // alias

        hexToUtf8: utils.hexToUtf8,
        hexToString: utils.hexToUtf8,
        toUtf8: utils.hexToUtf8,

        utf8ToHex: utils.utf8ToHex,
        stringToHex: utils.utf8ToHex,
        fromUtf8: utils.utf8ToHex,

        hexToAscii: hexToAscii,
        toAscii: hexToAscii,
        asciiToHex: asciiToHex,
        fromAscii: asciiToHex,

        unitMap: ethjsUnit.unitMap,
        toWei: toWei,
        fromWei: fromWei,

        padLeft: utils.leftPad,
        leftPad: utils.leftPad,
        padRight: utils.rightPad,
        rightPad: utils.rightPad,
        toTwosComplement: utils.toTwosComplement
      };
    }, { "./soliditySha3.js": 87, "./utils.js": 88, "ethjs-unit": 11, "randomhex": 34, "underscore": 53 }], 87: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file soliditySha3.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      var _ = require('underscore');
      var BN = require('bn.js');
      var utils = require('./utils.js');

      var _elementaryName = function _elementaryName(name) {
        /*jshint maxcomplexity:false */

        if (name.startsWith('int[')) {
          return 'int256' + name.slice(3);
        } else if (name === 'int') {
          return 'int256';
        } else if (name.startsWith('uint[')) {
          return 'uint256' + name.slice(4);
        } else if (name === 'uint') {
          return 'uint256';
        } else if (name.startsWith('fixed[')) {
          return 'fixed128x128' + name.slice(5);
        } else if (name === 'fixed') {
          return 'fixed128x128';
        } else if (name.startsWith('ufixed[')) {
          return 'ufixed128x128' + name.slice(6);
        } else if (name === 'ufixed') {
          return 'ufixed128x128';
        }
        return name;
      };

      // Parse N from type<N>
      var _parseTypeN = function _parseTypeN(type) {
        var typesize = /^\D+(\d+).*$/.exec(type);
        return typesize ? parseInt(typesize[1], 10) : null;
      };

      // Parse N from type[<N>]
      var _parseTypeNArray = function _parseTypeNArray(type) {
        var arraySize = /^\D+\d*\[(\d+)\]$/.exec(type);
        return arraySize ? parseInt(arraySize[1], 10) : null;
      };

      var _parseNumber = function _parseNumber(arg) {
        var type = typeof arg === "undefined" ? "undefined" : _typeof(arg);
        if (type === 'string') {
          if (utils.isHexStrict(arg)) {
            return new BN(arg.replace(/0x/i, ''), 16);
          } else {
            return new BN(arg, 10);
          }
        } else if (type === 'number') {
          return new BN(arg);
        } else if (utils.isBigNumber(arg)) {
          return new BN(arg.toString(10));
        } else if (utils.isBN(arg)) {
          return arg;
        } else {
          throw new Error(arg + ' is not a number');
        }
      };

      var _solidityPack = function _solidityPack(type, value, arraySize) {
        /*jshint maxcomplexity:false */

        var size, num;
        type = _elementaryName(type);

        if (type === 'bytes') {

          if (value.replace(/^0x/i, '').length % 2 !== 0) {
            throw new Error('Invalid bytes characters ' + value.length);
          }

          return value;
        } else if (type === 'string') {
          return utils.utf8ToHex(value);
        } else if (type === 'bool') {
          return value ? '01' : '00';
        } else if (type.startsWith('address')) {
          if (arraySize) {
            size = 64;
          } else {
            size = 40;
          }

          if (!utils.isAddress(value)) {
            throw new Error(value + ' is not a valid address, or the checksum is invalid.');
          }

          return utils.leftPad(value.toLowerCase(), size);
        }

        size = _parseTypeN(type);

        if (type.startsWith('bytes')) {

          if (!size) {
            throw new Error('bytes[] not yet supported in solidity');
          }

          // must be 32 byte slices when in an array
          if (arraySize) {
            size = 32;
          }

          if (size < 1 || size > 32 || size < value.replace(/^0x/i, '').length / 2) {
            throw new Error('Invalid bytes' + size + ' for ' + value);
          }

          return utils.rightPad(value, size * 2);
        } else if (type.startsWith('uint')) {

          if (size % 8 || size < 8 || size > 256) {
            throw new Error('Invalid uint' + size + ' size');
          }

          num = _parseNumber(value);
          if (num.bitLength() > size) {
            throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
          }

          if (num.lt(new BN(0))) {
            throw new Error('Supplied uint ' + num.toString() + ' is negative');
          }

          return size ? utils.leftPad(num.toString('hex'), size / 8 * 2) : num;
        } else if (type.startsWith('int')) {

          if (size % 8 || size < 8 || size > 256) {
            throw new Error('Invalid int' + size + ' size');
          }

          num = _parseNumber(value);
          if (num.bitLength() > size) {
            throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
          }

          if (num.lt(new BN(0))) {
            return num.toTwos(size).toString('hex');
          } else {
            return size ? utils.leftPad(num.toString('hex'), size / 8 * 2) : num;
          }
        } else {
          // FIXME: support all other types
          throw new Error('Unsupported or invalid type: ' + type);
        }
      };

      var _processSoliditySha3Args = function _processSoliditySha3Args(arg) {
        /*jshint maxcomplexity:false */

        if (_.isArray(arg)) {
          throw new Error('Autodetection of array types is not supported.');
        }

        var type,
            value = '';
        var hexArg, arraySize;

        // if type is given
        if (_.isObject(arg) && (arg.hasOwnProperty('v') || arg.hasOwnProperty('t') || arg.hasOwnProperty('value') || arg.hasOwnProperty('type'))) {
          type = arg.hasOwnProperty('t') ? arg.t : arg.type;
          value = arg.hasOwnProperty('v') ? arg.v : arg.value;

          // otherwise try to guess the type
        } else {

          type = utils.toHex(arg, true);
          value = utils.toHex(arg);

          if (!type.startsWith('int') && !type.startsWith('uint')) {
            type = 'bytes';
          }
        }

        if ((type.startsWith('int') || type.startsWith('uint')) && typeof value === 'string' && !/^(-)?0x/i.test(value)) {
          value = new BN(value);
        }

        // get the array size
        if (_.isArray(value)) {
          arraySize = _parseTypeNArray(type);
          if (arraySize && value.length !== arraySize) {
            throw new Error(type + ' is not matching the given array ' + JSON.stringify(value));
          } else {
            arraySize = value.length;
          }
        }

        if (_.isArray(value)) {
          hexArg = value.map(function (val) {
            return _solidityPack(type, val, arraySize).toString('hex').replace('0x', '');
          });
          return hexArg.join('');
        } else {
          hexArg = _solidityPack(type, value, arraySize);
          return hexArg.toString('hex').replace('0x', '');
        }
      };

      /**
       * Hashes solidity values to a sha3 hash using keccak 256
       *
       * @method soliditySha3
       * @return {Object} the sha3
       */
      var soliditySha3 = function soliditySha3() {
        /*jshint maxcomplexity:false */

        var args = Array.prototype.slice.call(arguments);

        var hexArgs = _.map(args, _processSoliditySha3Args);

        // console.log(args, hexArgs);
        // console.log('0x'+ hexArgs.join(''));

        return utils.sha3('0x' + hexArgs.join(''));
      };

      module.exports = soliditySha3;
    }, { "./utils.js": 88, "bn.js": "BN", "underscore": 53 }], 88: [function (require, module, exports) {
      /*
       This file is part of web3.js.
      
       web3.js is free software: you can redistribute it and/or modify
       it under the terms of the GNU Lesser General Public License as published by
       the Free Software Foundation, either version 3 of the License, or
       (at your option) any later version.
      
       web3.js is distributed in the hope that it will be useful,
       but WITHOUT ANY WARRANTY; without even the implied warranty of
       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       GNU Lesser General Public License for more details.
      
       You should have received a copy of the GNU Lesser General Public License
       along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
       */
      /**
       * @file utils.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      var _ = require('underscore');
      var BN = require('bn.js');
      var numberToBN = require('number-to-bn');
      var utf8 = require('utf8');
      var Hash = require("eth-lib/lib/hash");

      /**
       * Returns true if object is BN, otherwise false
       *
       * @method isBN
       * @param {Object} object
       * @return {Boolean}
       */
      var isBN = function isBN(object) {
        return object instanceof BN || object && object.constructor && object.constructor.name === 'BN';
      };

      /**
       * Returns true if object is BigNumber, otherwise false
       *
       * @method isBigNumber
       * @param {Object} object
       * @return {Boolean}
       */
      var isBigNumber = function isBigNumber(object) {
        return object && object.constructor && object.constructor.name === 'BigNumber';
      };

      /**
       * Takes an input and transforms it into an BN
       *
       * @method toBN
       * @param {Number|String|BN} number, string, HEX string or BN
       * @return {BN} BN
       */
      var toBN = function toBN(number) {
        try {
          return numberToBN.apply(null, arguments);
        } catch (e) {
          throw new Error(e + ' Given value: "' + number + '"');
        }
      };

      /**
       * Takes and input transforms it into BN and if it is negative value, into two's complement
       *
       * @method toTwosComplement
       * @param {Number|String|BN} number
       * @return {String}
       */
      var toTwosComplement = function toTwosComplement(number) {
        return '0x' + toBN(number).toTwos(256).toString(16, 64);
      };

      /**
       * Checks if the given string is an address
       *
       * @method isAddress
       * @param {String} address the given HEX address
       * @return {Boolean}
       */
      var isAddress = function isAddress(address) {
        // check if it has the basic requirements of an address
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
          return false;
          // If it's ALL lowercase or ALL upppercase
        } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
          return true;
          // Otherwise check each case
        } else {
          return checkAddressChecksum(address);
        }
      };

      /**
       * Checks if the given string is a checksummed address
       *
       * @method checkAddressChecksum
       * @param {String} address the given HEX address
       * @return {Boolean}
       */
      var checkAddressChecksum = function checkAddressChecksum(address) {
        // Check each case
        address = address.replace(/^0x/i, '');
        var addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '');

        for (var i = 0; i < 40; i++) {
          // the nth letter should be uppercase if the nth digit of casemap is 1
          if (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i] || parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i]) {
            return false;
          }
        }
        return true;
      };

      /**
       * Should be called to pad string to expected length
       *
       * @method leftPad
       * @param {String} string to be padded
       * @param {Number} chars that result string should have
       * @param {String} sign, by default 0
       * @returns {String} right aligned string
       */
      var leftPad = function leftPad(string, chars, sign) {
        var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
        string = string.toString(16).replace(/^0x/i, '');

        var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

        return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : "0") + string;
      };

      /**
       * Should be called to pad string to expected length
       *
       * @method rightPad
       * @param {String} string to be padded
       * @param {Number} chars that result string should have
       * @param {String} sign, by default 0
       * @returns {String} right aligned string
       */
      var rightPad = function rightPad(string, chars, sign) {
        var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
        string = string.toString(16).replace(/^0x/i, '');

        var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

        return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign ? sign : "0");
      };

      /**
       * Should be called to get hex representation (prefixed by 0x) of utf8 string
       *
       * @method utf8ToHex
       * @param {String} str
       * @returns {String} hex representation of input string
       */
      var utf8ToHex = function utf8ToHex(str) {
        str = utf8.encode(str);
        var hex = "";

        // remove \u0000 padding from either side
        str = str.replace(/^(?:\u0000)*/, '');
        str = str.split("").reverse().join("");
        str = str.replace(/^(?:\u0000)*/, '');
        str = str.split("").reverse().join("");

        for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);
          // if (code !== 0) {
          var n = code.toString(16);
          hex += n.length < 2 ? '0' + n : n;
          // }
        }

        return "0x" + hex;
      };

      /**
       * Should be called to get utf8 from it's hex representation
       *
       * @method hexToUtf8
       * @param {String} hex
       * @returns {String} ascii string representation of hex value
       */
      var hexToUtf8 = function hexToUtf8(hex) {
        if (!isHexStrict(hex)) throw new Error('The parameter "' + hex + '" must be a valid HEX string.');

        var str = "";
        var code = 0;
        hex = hex.replace(/^0x/i, '');

        // remove 00 padding from either side
        hex = hex.replace(/^(?:00)*/, '');
        hex = hex.split("").reverse().join("");
        hex = hex.replace(/^(?:00)*/, '');
        hex = hex.split("").reverse().join("");

        var l = hex.length;

        for (var i = 0; i < l; i += 2) {
          code = parseInt(hex.substr(i, 2), 16);
          // if (code !== 0) {
          str += String.fromCharCode(code);
          // }
        }

        return utf8.decode(str);
      };

      /**
       * Converts value to it's number representation
       *
       * @method hexToNumber
       * @param {String|Number|BN} value
       * @return {String}
       */
      var hexToNumber = function hexToNumber(value) {
        if (!value) {
          return value;
        }

        return toBN(value).toNumber();
      };

      /**
       * Converts value to it's decimal representation in string
       *
       * @method hexToNumberString
       * @param {String|Number|BN} value
       * @return {String}
       */
      var hexToNumberString = function hexToNumberString(value) {
        if (!value) return value;

        return toBN(value).toString(10);
      };

      /**
       * Converts value to it's hex representation
       *
       * @method numberToHex
       * @param {String|Number|BN} value
       * @return {String}
       */
      var numberToHex = function numberToHex(value) {
        if (_.isNull(value) || _.isUndefined(value)) {
          return value;
        }

        if (!isFinite(value) && !isHexStrict(value)) {
          throw new Error('Given input "' + value + '" is not a number.');
        }

        var number = toBN(value);
        var result = number.toString(16);

        return number.lt(new BN(0)) ? '-0x' + result.substr(1) : '0x' + result;
      };

      /**
       * Convert a byte array to a hex string
       *
       * Note: Implementation from crypto-js
       *
       * @method bytesToHex
       * @param {Array} bytes
       * @return {String} the hex string
       */
      var bytesToHex = function bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          /* jshint ignore:start */
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 0xF).toString(16));
          /* jshint ignore:end */
        }
        return '0x' + hex.join("");
      };

      /**
       * Convert a hex string to a byte array
       *
       * Note: Implementation from crypto-js
       *
       * @method hexToBytes
       * @param {string} hex
       * @return {Array} the byte array
       */
      var hexToBytes = function hexToBytes(hex) {
        hex = hex.toString(16);

        if (!isHexStrict(hex)) {
          throw new Error('Given value "' + hex + '" is not a valid hex string.');
        }

        hex = hex.replace(/^0x/i, '');

        for (var bytes = [], c = 0; c < hex.length; c += 2) {
          bytes.push(parseInt(hex.substr(c, 2), 16));
        }return bytes;
      };

      /**
       * Auto converts any given value into it's hex representation.
       *
       * And even stringifys objects before.
       *
       * @method toHex
       * @param {String|Number|BN|Object} value
       * @param {Boolean} returnType
       * @return {String}
       */
      var toHex = function toHex(value, returnType) {
        /*jshint maxcomplexity: false */

        if (isAddress(value)) {
          return returnType ? 'address' : '0x' + value.toLowerCase().replace(/^0x/i, '');
        }

        if (_.isBoolean(value)) {
          return returnType ? 'bool' : value ? '0x01' : '0x00';
        }

        if (_.isObject(value) && !isBigNumber(value) && !isBN(value)) {
          return returnType ? 'string' : utf8ToHex(JSON.stringify(value));
        }

        // if its a negative number, pass it through numberToHex
        if (_.isString(value)) {
          if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
            return returnType ? 'int256' : numberToHex(value);
          } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
            return returnType ? 'bytes' : value;
          } else if (!isFinite(value)) {
            return returnType ? 'string' : utf8ToHex(value);
          }
        }

        return returnType ? value < 0 ? 'int256' : 'uint256' : numberToHex(value);
      };

      /**
       * Check if string is HEX, requires a 0x in front
       *
       * @method isHexStrict
       * @param {String} hex to be checked
       * @returns {Boolean}
       */
      var isHexStrict = function isHexStrict(hex) {
        return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
      };

      /**
       * Check if string is HEX
       *
       * @method isHex
       * @param {String} hex to be checked
       * @returns {Boolean}
       */
      var isHex = function isHex(hex) {
        return (_.isString(hex) || _.isNumber(hex)) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex);
      };

      /**
       * Returns true if given string is a valid Ethereum block header bloom.
       *
       * TODO UNDOCUMENTED
       *
       * @method isBloom
       * @param {String} hex encoded bloom filter
       * @return {Boolean}
       */
      var isBloom = function isBloom(bloom) {
        if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
          return false;
        } else if (/^(0x)?[0-9a-f]{512}$/.test(bloom) || /^(0x)?[0-9A-F]{512}$/.test(bloom)) {
          return true;
        }
        return false;
      };

      /**
       * Returns true if given string is a valid log topic.
       *
       * TODO UNDOCUMENTED
       *
       * @method isTopic
       * @param {String} hex encoded topic
       * @return {Boolean}
       */
      var isTopic = function isTopic(topic) {
        if (!/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
          return false;
        } else if (/^(0x)?[0-9a-f]{64}$/.test(topic) || /^(0x)?[0-9A-F]{64}$/.test(topic)) {
          return true;
        }
        return false;
      };

      /**
       * Hashes values to a sha3 hash using keccak 256
       *
       * To hash a HEX string the hex must have 0x in front.
       *
       * @method sha3
       * @return {String} the sha3 string
       */
      var SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

      var sha3 = function sha3(value) {
        if (isHexStrict(value) && /^0x/i.test(value.toString())) {
          value = hexToBytes(value);
        }

        var returnValue = Hash.keccak256(value); // jshint ignore:line

        if (returnValue === SHA3_NULL_S) {
          return null;
        } else {
          return returnValue;
        }
      };
      // expose the under the hood keccak256
      sha3._Hash = Hash;

      module.exports = {
        BN: BN,
        isBN: isBN,
        isBigNumber: isBigNumber,
        toBN: toBN,
        isAddress: isAddress,
        isBloom: isBloom, // TODO UNDOCUMENTED
        isTopic: isTopic, // TODO UNDOCUMENTED
        checkAddressChecksum: checkAddressChecksum,
        utf8ToHex: utf8ToHex,
        hexToUtf8: hexToUtf8,
        hexToNumber: hexToNumber,
        hexToNumberString: hexToNumberString,
        numberToHex: numberToHex,
        toHex: toHex,
        hexToBytes: hexToBytes,
        bytesToHex: bytesToHex,
        isHex: isHex,
        isHexStrict: isHexStrict,
        leftPad: leftPad,
        rightPad: rightPad,
        toTwosComplement: toTwosComplement,
        sha3: sha3
      };
    }, { "bn.js": "BN", "eth-lib/lib/hash": 10, "number-to-bn": 23, "underscore": 53, "utf8": 56 }], "BN": [function (require, module, exports) {
      (function (module, exports) {
        'use strict';

        // Utils

        function assert(val, msg) {
          if (!val) throw new Error(msg || 'Assertion failed');
        }

        // Could use `inherits` module, but don't want to move from single file
        // architecture yet.
        function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function TempCtor() {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }

        // BN

        function BN(number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }

          this.negative = 0;
          this.words = null;
          this.length = 0;

          // Reduction context
          this.red = null;

          if (number !== null) {
            if (base === 'le' || base === 'be') {
              endian = base;
              base = 10;
            }

            this._init(number || 0, base || 10, endian || 'be');
          }
        }
        if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
          module.exports = BN;
        } else {
          exports.BN = BN;
        }

        BN.BN = BN;
        BN.wordSize = 26;

        var Buffer;
        try {
          Buffer = require('buffer').Buffer;
        } catch (e) {}

        BN.isBN = function isBN(num) {
          if (num instanceof BN) {
            return true;
          }

          return num !== null && (typeof num === "undefined" ? "undefined" : _typeof(num)) === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };

        BN.max = function max(left, right) {
          if (left.cmp(right) > 0) return left;
          return right;
        };

        BN.min = function min(left, right) {
          if (left.cmp(right) < 0) return left;
          return right;
        };

        BN.prototype._init = function init(number, base, endian) {
          if (typeof number === 'number') {
            return this._initNumber(number, base, endian);
          }

          if ((typeof number === "undefined" ? "undefined" : _typeof(number)) === 'object') {
            return this._initArray(number, base, endian);
          }

          if (base === 'hex') {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);

          number = number.toString().replace(/\s+/g, '');
          var start = 0;
          if (number[0] === '-') {
            start++;
          }

          if (base === 16) {
            this._parseHex(number, start);
          } else {
            this._parseBase(number, base, start);
          }

          if (number[0] === '-') {
            this.negative = 1;
          }

          this.strip();

          if (endian !== 'le') return;

          this._initArray(this.toArray(), base, endian);
        };

        BN.prototype._initNumber = function _initNumber(number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 0x4000000) {
            this.words = [number & 0x3ffffff];
            this.length = 1;
          } else if (number < 0x10000000000000) {
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
            this.length = 2;
          } else {
            assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
            this.length = 3;
          }

          if (endian !== 'le') return;

          // Reverse the bytes
          this._initArray(this.toArray(), base, endian);
        };

        BN.prototype._initArray = function _initArray(number, base, endian) {
          // Perhaps a Uint8Array
          assert(typeof number.length === 'number');
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }

          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          var j, w;
          var off = 0;
          if (endian === 'be') {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === 'le') {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this.strip();
        };

        function parseHex(str, start, end) {
          var r = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;

            r <<= 4;

            // 'a' - 'f'
            if (c >= 49 && c <= 54) {
              r |= c - 49 + 0xa;

              // 'A' - 'F'
            } else if (c >= 17 && c <= 22) {
              r |= c - 17 + 0xa;

              // '0' - '9'
            } else {
              r |= c & 0xf;
            }
          }
          return r;
        }

        BN.prototype._parseHex = function _parseHex(number, start) {
          // Create possibly bigger array to ensure that it fits the number
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          var j, w;
          // Scan 24-bit chunks and add them to the number
          var off = 0;
          for (i = number.length - 6, j = 0; i >= start; i -= 6) {
            w = parseHex(number, i, i + 6);
            this.words[j] |= w << off & 0x3ffffff;
            // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
          if (i + 6 !== start) {
            w = parseHex(number, start, i + 6);
            this.words[j] |= w << off & 0x3ffffff;
            this.words[j + 1] |= w >>> 26 - off & 0x3fffff;
          }
          this.strip();
        };

        function parseBase(str, start, end, mul) {
          var r = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;

            r *= mul;

            // 'a'
            if (c >= 49) {
              r += c - 49 + 0xa;

              // 'A'
            } else if (c >= 17) {
              r += c - 17 + 0xa;

              // '0' - '9'
            } else {
              r += c;
            }
          }
          return r;
        }

        BN.prototype._parseBase = function _parseBase(number, base, start) {
          // Initialize as zero
          this.words = [0];
          this.length = 1;

          // Find length of limb in base
          for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = limbPow / base | 0;

          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;

          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);

            this.imuln(limbPow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }

          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);

            for (i = 0; i < mod; i++) {
              pow *= base;
            }

            this.imuln(pow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
        };

        BN.prototype.copy = function copy(dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };

        BN.prototype.clone = function clone() {
          var r = new BN(null);
          this.copy(r);
          return r;
        };

        BN.prototype._expand = function _expand(size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };

        // Remove leading `0` from `this`
        BN.prototype.strip = function strip() {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };

        BN.prototype._normSign = function _normSign() {
          // -0 = 0
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };

        BN.prototype.inspect = function inspect() {
          return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
        };

        /*
         var zeros = [];
        var groupSizes = [];
        var groupBases = [];
         var s = '';
        var i = -1;
        while (++i < BN.wordSize) {
          zeros[i] = s;
          s += '0';
        }
        groupSizes[0] = 0;
        groupSizes[1] = 0;
        groupBases[0] = 0;
        groupBases[1] = 0;
        var base = 2 - 1;
        while (++base < 36 + 1) {
          var groupSize = 0;
          var groupBase = 1;
          while (groupBase < (1 << BN.wordSize) / base) {
            groupBase *= base;
            groupSize += 1;
          }
          groupSizes[base] = groupSize;
          groupBases[base] = groupBase;
        }
         */

        var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];

        var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

        var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

        BN.prototype.toString = function toString(base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;

          var out;
          if (base === 16 || base === 'hex') {
            out = '';
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = ((w << off | carry) & 0xffffff).toString(16);
              carry = w >>> 24 - off & 0xffffff;
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          if (base === (base | 0) && base >= 2 && base <= 36) {
            // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
            var groupSize = groupSizes[base];
            // var groupBase = Math.pow(base, groupSize);
            var groupBase = groupBases[base];
            out = '';
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modn(groupBase).toString(base);
              c = c.idivn(groupBase);

              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = '0' + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          assert(false, 'Base should be between 2 and 36');
        };

        BN.prototype.toNumber = function toNumber() {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 0x4000000;
          } else if (this.length === 3 && this.words[2] === 0x01) {
            // NOTE: at this stage it is known that the top bit is set
            ret += 0x10000000000000 + this.words[1] * 0x4000000;
          } else if (this.length > 2) {
            assert(false, 'Number can only safely store up to 53 bits');
          }
          return this.negative !== 0 ? -ret : ret;
        };

        BN.prototype.toJSON = function toJSON() {
          return this.toString(16);
        };

        BN.prototype.toBuffer = function toBuffer(endian, length) {
          assert(typeof Buffer !== 'undefined');
          return this.toArrayLike(Buffer, endian, length);
        };

        BN.prototype.toArray = function toArray(endian, length) {
          return this.toArrayLike(Array, endian, length);
        };

        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, 'byte array longer than desired length');
          assert(reqLength > 0, 'Requested array length <= 0');

          this.strip();
          var littleEndian = endian === 'le';
          var res = new ArrayType(reqLength);

          var b, i;
          var q = this.clone();
          if (!littleEndian) {
            // Assume big-endian
            for (i = 0; i < reqLength - byteLength; i++) {
              res[i] = 0;
            }

            for (i = 0; !q.isZero(); i++) {
              b = q.andln(0xff);
              q.iushrn(8);

              res[reqLength - i - 1] = b;
            }
          } else {
            for (i = 0; !q.isZero(); i++) {
              b = q.andln(0xff);
              q.iushrn(8);

              res[i] = b;
            }

            for (; i < reqLength; i++) {
              res[i] = 0;
            }
          }

          return res;
        };

        if (Math.clz32) {
          BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 0x1000) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 0x40) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 0x8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 0x02) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }

        BN.prototype._zeroBits = function _zeroBits(w) {
          // Short-cut
          if (w === 0) return 26;

          var t = w;
          var r = 0;
          if ((t & 0x1fff) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 0x7f) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 0xf) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 0x3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 0x1) === 0) {
            r++;
          }
          return r;
        };

        // Return number of used bits in a BN
        BN.prototype.bitLength = function bitLength() {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };

        function toBitArray(num) {
          var w = new Array(num.bitLength());

          for (var bit = 0; bit < w.length; bit++) {
            var off = bit / 26 | 0;
            var wbit = bit % 26;

            w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
          }

          return w;
        }

        // Number of trailing zero bits
        BN.prototype.zeroBits = function zeroBits() {
          if (this.isZero()) return 0;

          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26) break;
          }
          return r;
        };

        BN.prototype.byteLength = function byteLength() {
          return Math.ceil(this.bitLength() / 8);
        };

        BN.prototype.toTwos = function toTwos(width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };

        BN.prototype.fromTwos = function fromTwos(width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };

        BN.prototype.isNeg = function isNeg() {
          return this.negative !== 0;
        };

        // Return negative clone of `this`
        BN.prototype.neg = function neg() {
          return this.clone().ineg();
        };

        BN.prototype.ineg = function ineg() {
          if (!this.isZero()) {
            this.negative ^= 1;
          }

          return this;
        };

        // Or `num` with `this` in-place
        BN.prototype.iuor = function iuor(num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }

          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }

          return this.strip();
        };

        BN.prototype.ior = function ior(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };

        // Or `num` with `this`
        BN.prototype.or = function or(num) {
          if (this.length > num.length) return this.clone().ior(num);
          return num.clone().ior(this);
        };

        BN.prototype.uor = function uor(num) {
          if (this.length > num.length) return this.clone().iuor(num);
          return num.clone().iuor(this);
        };

        // And `num` with `this` in-place
        BN.prototype.iuand = function iuand(num) {
          // b = min-length(num, this)
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }

          this.length = b.length;

          return this.strip();
        };

        BN.prototype.iand = function iand(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };

        // And `num` with `this`
        BN.prototype.and = function and(num) {
          if (this.length > num.length) return this.clone().iand(num);
          return num.clone().iand(this);
        };

        BN.prototype.uand = function uand(num) {
          if (this.length > num.length) return this.clone().iuand(num);
          return num.clone().iuand(this);
        };

        // Xor `num` with `this` in-place
        BN.prototype.iuxor = function iuxor(num) {
          // a.length > b.length
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }

          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = a.length;

          return this.strip();
        };

        BN.prototype.ixor = function ixor(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };

        // Xor `num` with `this`
        BN.prototype.xor = function xor(num) {
          if (this.length > num.length) return this.clone().ixor(num);
          return num.clone().ixor(this);
        };

        BN.prototype.uxor = function uxor(num) {
          if (this.length > num.length) return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };

        // Not ``this`` with ``width`` bitwidth
        BN.prototype.inotn = function inotn(width) {
          assert(typeof width === 'number' && width >= 0);

          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;

          // Extend the buffer with leading zeroes
          this._expand(bytesNeeded);

          if (bitsLeft > 0) {
            bytesNeeded--;
          }

          // Handle complete words
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 0x3ffffff;
          }

          // Handle the residue
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
          }

          // And remove leading zeroes
          return this.strip();
        };

        BN.prototype.notn = function notn(width) {
          return this.clone().inotn(width);
        };

        // Set `bit` of `this`
        BN.prototype.setn = function setn(bit, val) {
          assert(typeof bit === 'number' && bit >= 0);

          var off = bit / 26 | 0;
          var wbit = bit % 26;

          this._expand(off + 1);

          if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }

          return this.strip();
        };

        // Add `num` to `this` in-place
        BN.prototype.iadd = function iadd(num) {
          var r;

          // negative + positive
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();

            // positive + negative
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }

          // a.length > b.length
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }

          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
            // Copy the rest of the words
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          return this;
        };

        // Add `num` to `this`
        BN.prototype.add = function add(num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }

          if (this.length > num.length) return this.clone().iadd(num);

          return num.clone().iadd(this);
        };

        // Subtract `num` from `this` in-place
        BN.prototype.isub = function isub(num) {
          // this - (-num) = this + num
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();

            // -this - num = -(this + num)
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }

          // At this point both numbers are positive
          var cmp = this.cmp(num);

          // Optimization - zeroify
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }

          // a > b
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }

          // Copy rest of the words
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = Math.max(this.length, i);

          if (a !== this) {
            this.negative = 1;
          }

          return this.strip();
        };

        // Subtract `num` from `this`
        BN.prototype.sub = function sub(num) {
          return this.clone().isub(num);
        };

        function smallMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          var len = self.length + num.length | 0;
          out.length = len;
          len = len - 1 | 0;

          // Peel one iteration (compiler can't do it, because of code complexity)
          var a = self.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          var carry = r / 0x4000000 | 0;
          out.words[0] = lo;

          for (var k = 1; k < len; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = carry >>> 26;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j | 0;
              a = self.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += r / 0x4000000 | 0;
              rword = r & 0x3ffffff;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }

          return out.strip();
        }

        // TODO(indutny): it may be reasonable to omit it for users who don't need
        // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
        // multiplication (like elliptic secp256k1).
        var comb10MulTo = function comb10MulTo(self, num, out) {
          var a = self.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 0x1fff;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 0x1fff;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 0x1fff;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 0x1fff;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 0x1fff;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 0x1fff;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 0x1fff;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 0x1fff;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 0x1fff;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 0x1fff;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 0x1fff;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 0x1fff;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 0x1fff;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 0x1fff;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 0x1fff;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 0x1fff;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 0x1fff;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 0x1fff;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 0x1fff;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 0x1fff;
          var bh9 = b9 >>> 13;

          out.negative = self.negative ^ num.negative;
          out.length = 19;
          /* k = 0 */
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = mid + Math.imul(ah0, bl0) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
          w0 &= 0x3ffffff;
          /* k = 1 */
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = mid + Math.imul(ah1, bl0) | 0;
          hi = Math.imul(ah1, bh0);
          lo = lo + Math.imul(al0, bl1) | 0;
          mid = mid + Math.imul(al0, bh1) | 0;
          mid = mid + Math.imul(ah0, bl1) | 0;
          hi = hi + Math.imul(ah0, bh1) | 0;
          var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
          w1 &= 0x3ffffff;
          /* k = 2 */
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = mid + Math.imul(ah2, bl0) | 0;
          hi = Math.imul(ah2, bh0);
          lo = lo + Math.imul(al1, bl1) | 0;
          mid = mid + Math.imul(al1, bh1) | 0;
          mid = mid + Math.imul(ah1, bl1) | 0;
          hi = hi + Math.imul(ah1, bh1) | 0;
          lo = lo + Math.imul(al0, bl2) | 0;
          mid = mid + Math.imul(al0, bh2) | 0;
          mid = mid + Math.imul(ah0, bl2) | 0;
          hi = hi + Math.imul(ah0, bh2) | 0;
          var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
          w2 &= 0x3ffffff;
          /* k = 3 */
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = mid + Math.imul(ah3, bl0) | 0;
          hi = Math.imul(ah3, bh0);
          lo = lo + Math.imul(al2, bl1) | 0;
          mid = mid + Math.imul(al2, bh1) | 0;
          mid = mid + Math.imul(ah2, bl1) | 0;
          hi = hi + Math.imul(ah2, bh1) | 0;
          lo = lo + Math.imul(al1, bl2) | 0;
          mid = mid + Math.imul(al1, bh2) | 0;
          mid = mid + Math.imul(ah1, bl2) | 0;
          hi = hi + Math.imul(ah1, bh2) | 0;
          lo = lo + Math.imul(al0, bl3) | 0;
          mid = mid + Math.imul(al0, bh3) | 0;
          mid = mid + Math.imul(ah0, bl3) | 0;
          hi = hi + Math.imul(ah0, bh3) | 0;
          var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
          w3 &= 0x3ffffff;
          /* k = 4 */
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = mid + Math.imul(ah4, bl0) | 0;
          hi = Math.imul(ah4, bh0);
          lo = lo + Math.imul(al3, bl1) | 0;
          mid = mid + Math.imul(al3, bh1) | 0;
          mid = mid + Math.imul(ah3, bl1) | 0;
          hi = hi + Math.imul(ah3, bh1) | 0;
          lo = lo + Math.imul(al2, bl2) | 0;
          mid = mid + Math.imul(al2, bh2) | 0;
          mid = mid + Math.imul(ah2, bl2) | 0;
          hi = hi + Math.imul(ah2, bh2) | 0;
          lo = lo + Math.imul(al1, bl3) | 0;
          mid = mid + Math.imul(al1, bh3) | 0;
          mid = mid + Math.imul(ah1, bl3) | 0;
          hi = hi + Math.imul(ah1, bh3) | 0;
          lo = lo + Math.imul(al0, bl4) | 0;
          mid = mid + Math.imul(al0, bh4) | 0;
          mid = mid + Math.imul(ah0, bl4) | 0;
          hi = hi + Math.imul(ah0, bh4) | 0;
          var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
          w4 &= 0x3ffffff;
          /* k = 5 */
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = mid + Math.imul(ah5, bl0) | 0;
          hi = Math.imul(ah5, bh0);
          lo = lo + Math.imul(al4, bl1) | 0;
          mid = mid + Math.imul(al4, bh1) | 0;
          mid = mid + Math.imul(ah4, bl1) | 0;
          hi = hi + Math.imul(ah4, bh1) | 0;
          lo = lo + Math.imul(al3, bl2) | 0;
          mid = mid + Math.imul(al3, bh2) | 0;
          mid = mid + Math.imul(ah3, bl2) | 0;
          hi = hi + Math.imul(ah3, bh2) | 0;
          lo = lo + Math.imul(al2, bl3) | 0;
          mid = mid + Math.imul(al2, bh3) | 0;
          mid = mid + Math.imul(ah2, bl3) | 0;
          hi = hi + Math.imul(ah2, bh3) | 0;
          lo = lo + Math.imul(al1, bl4) | 0;
          mid = mid + Math.imul(al1, bh4) | 0;
          mid = mid + Math.imul(ah1, bl4) | 0;
          hi = hi + Math.imul(ah1, bh4) | 0;
          lo = lo + Math.imul(al0, bl5) | 0;
          mid = mid + Math.imul(al0, bh5) | 0;
          mid = mid + Math.imul(ah0, bl5) | 0;
          hi = hi + Math.imul(ah0, bh5) | 0;
          var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
          w5 &= 0x3ffffff;
          /* k = 6 */
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = mid + Math.imul(ah6, bl0) | 0;
          hi = Math.imul(ah6, bh0);
          lo = lo + Math.imul(al5, bl1) | 0;
          mid = mid + Math.imul(al5, bh1) | 0;
          mid = mid + Math.imul(ah5, bl1) | 0;
          hi = hi + Math.imul(ah5, bh1) | 0;
          lo = lo + Math.imul(al4, bl2) | 0;
          mid = mid + Math.imul(al4, bh2) | 0;
          mid = mid + Math.imul(ah4, bl2) | 0;
          hi = hi + Math.imul(ah4, bh2) | 0;
          lo = lo + Math.imul(al3, bl3) | 0;
          mid = mid + Math.imul(al3, bh3) | 0;
          mid = mid + Math.imul(ah3, bl3) | 0;
          hi = hi + Math.imul(ah3, bh3) | 0;
          lo = lo + Math.imul(al2, bl4) | 0;
          mid = mid + Math.imul(al2, bh4) | 0;
          mid = mid + Math.imul(ah2, bl4) | 0;
          hi = hi + Math.imul(ah2, bh4) | 0;
          lo = lo + Math.imul(al1, bl5) | 0;
          mid = mid + Math.imul(al1, bh5) | 0;
          mid = mid + Math.imul(ah1, bl5) | 0;
          hi = hi + Math.imul(ah1, bh5) | 0;
          lo = lo + Math.imul(al0, bl6) | 0;
          mid = mid + Math.imul(al0, bh6) | 0;
          mid = mid + Math.imul(ah0, bl6) | 0;
          hi = hi + Math.imul(ah0, bh6) | 0;
          var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
          w6 &= 0x3ffffff;
          /* k = 7 */
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = mid + Math.imul(ah7, bl0) | 0;
          hi = Math.imul(ah7, bh0);
          lo = lo + Math.imul(al6, bl1) | 0;
          mid = mid + Math.imul(al6, bh1) | 0;
          mid = mid + Math.imul(ah6, bl1) | 0;
          hi = hi + Math.imul(ah6, bh1) | 0;
          lo = lo + Math.imul(al5, bl2) | 0;
          mid = mid + Math.imul(al5, bh2) | 0;
          mid = mid + Math.imul(ah5, bl2) | 0;
          hi = hi + Math.imul(ah5, bh2) | 0;
          lo = lo + Math.imul(al4, bl3) | 0;
          mid = mid + Math.imul(al4, bh3) | 0;
          mid = mid + Math.imul(ah4, bl3) | 0;
          hi = hi + Math.imul(ah4, bh3) | 0;
          lo = lo + Math.imul(al3, bl4) | 0;
          mid = mid + Math.imul(al3, bh4) | 0;
          mid = mid + Math.imul(ah3, bl4) | 0;
          hi = hi + Math.imul(ah3, bh4) | 0;
          lo = lo + Math.imul(al2, bl5) | 0;
          mid = mid + Math.imul(al2, bh5) | 0;
          mid = mid + Math.imul(ah2, bl5) | 0;
          hi = hi + Math.imul(ah2, bh5) | 0;
          lo = lo + Math.imul(al1, bl6) | 0;
          mid = mid + Math.imul(al1, bh6) | 0;
          mid = mid + Math.imul(ah1, bl6) | 0;
          hi = hi + Math.imul(ah1, bh6) | 0;
          lo = lo + Math.imul(al0, bl7) | 0;
          mid = mid + Math.imul(al0, bh7) | 0;
          mid = mid + Math.imul(ah0, bl7) | 0;
          hi = hi + Math.imul(ah0, bh7) | 0;
          var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
          w7 &= 0x3ffffff;
          /* k = 8 */
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = mid + Math.imul(ah8, bl0) | 0;
          hi = Math.imul(ah8, bh0);
          lo = lo + Math.imul(al7, bl1) | 0;
          mid = mid + Math.imul(al7, bh1) | 0;
          mid = mid + Math.imul(ah7, bl1) | 0;
          hi = hi + Math.imul(ah7, bh1) | 0;
          lo = lo + Math.imul(al6, bl2) | 0;
          mid = mid + Math.imul(al6, bh2) | 0;
          mid = mid + Math.imul(ah6, bl2) | 0;
          hi = hi + Math.imul(ah6, bh2) | 0;
          lo = lo + Math.imul(al5, bl3) | 0;
          mid = mid + Math.imul(al5, bh3) | 0;
          mid = mid + Math.imul(ah5, bl3) | 0;
          hi = hi + Math.imul(ah5, bh3) | 0;
          lo = lo + Math.imul(al4, bl4) | 0;
          mid = mid + Math.imul(al4, bh4) | 0;
          mid = mid + Math.imul(ah4, bl4) | 0;
          hi = hi + Math.imul(ah4, bh4) | 0;
          lo = lo + Math.imul(al3, bl5) | 0;
          mid = mid + Math.imul(al3, bh5) | 0;
          mid = mid + Math.imul(ah3, bl5) | 0;
          hi = hi + Math.imul(ah3, bh5) | 0;
          lo = lo + Math.imul(al2, bl6) | 0;
          mid = mid + Math.imul(al2, bh6) | 0;
          mid = mid + Math.imul(ah2, bl6) | 0;
          hi = hi + Math.imul(ah2, bh6) | 0;
          lo = lo + Math.imul(al1, bl7) | 0;
          mid = mid + Math.imul(al1, bh7) | 0;
          mid = mid + Math.imul(ah1, bl7) | 0;
          hi = hi + Math.imul(ah1, bh7) | 0;
          lo = lo + Math.imul(al0, bl8) | 0;
          mid = mid + Math.imul(al0, bh8) | 0;
          mid = mid + Math.imul(ah0, bl8) | 0;
          hi = hi + Math.imul(ah0, bh8) | 0;
          var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
          w8 &= 0x3ffffff;
          /* k = 9 */
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = mid + Math.imul(ah9, bl0) | 0;
          hi = Math.imul(ah9, bh0);
          lo = lo + Math.imul(al8, bl1) | 0;
          mid = mid + Math.imul(al8, bh1) | 0;
          mid = mid + Math.imul(ah8, bl1) | 0;
          hi = hi + Math.imul(ah8, bh1) | 0;
          lo = lo + Math.imul(al7, bl2) | 0;
          mid = mid + Math.imul(al7, bh2) | 0;
          mid = mid + Math.imul(ah7, bl2) | 0;
          hi = hi + Math.imul(ah7, bh2) | 0;
          lo = lo + Math.imul(al6, bl3) | 0;
          mid = mid + Math.imul(al6, bh3) | 0;
          mid = mid + Math.imul(ah6, bl3) | 0;
          hi = hi + Math.imul(ah6, bh3) | 0;
          lo = lo + Math.imul(al5, bl4) | 0;
          mid = mid + Math.imul(al5, bh4) | 0;
          mid = mid + Math.imul(ah5, bl4) | 0;
          hi = hi + Math.imul(ah5, bh4) | 0;
          lo = lo + Math.imul(al4, bl5) | 0;
          mid = mid + Math.imul(al4, bh5) | 0;
          mid = mid + Math.imul(ah4, bl5) | 0;
          hi = hi + Math.imul(ah4, bh5) | 0;
          lo = lo + Math.imul(al3, bl6) | 0;
          mid = mid + Math.imul(al3, bh6) | 0;
          mid = mid + Math.imul(ah3, bl6) | 0;
          hi = hi + Math.imul(ah3, bh6) | 0;
          lo = lo + Math.imul(al2, bl7) | 0;
          mid = mid + Math.imul(al2, bh7) | 0;
          mid = mid + Math.imul(ah2, bl7) | 0;
          hi = hi + Math.imul(ah2, bh7) | 0;
          lo = lo + Math.imul(al1, bl8) | 0;
          mid = mid + Math.imul(al1, bh8) | 0;
          mid = mid + Math.imul(ah1, bl8) | 0;
          hi = hi + Math.imul(ah1, bh8) | 0;
          lo = lo + Math.imul(al0, bl9) | 0;
          mid = mid + Math.imul(al0, bh9) | 0;
          mid = mid + Math.imul(ah0, bl9) | 0;
          hi = hi + Math.imul(ah0, bh9) | 0;
          var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
          w9 &= 0x3ffffff;
          /* k = 10 */
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = mid + Math.imul(ah9, bl1) | 0;
          hi = Math.imul(ah9, bh1);
          lo = lo + Math.imul(al8, bl2) | 0;
          mid = mid + Math.imul(al8, bh2) | 0;
          mid = mid + Math.imul(ah8, bl2) | 0;
          hi = hi + Math.imul(ah8, bh2) | 0;
          lo = lo + Math.imul(al7, bl3) | 0;
          mid = mid + Math.imul(al7, bh3) | 0;
          mid = mid + Math.imul(ah7, bl3) | 0;
          hi = hi + Math.imul(ah7, bh3) | 0;
          lo = lo + Math.imul(al6, bl4) | 0;
          mid = mid + Math.imul(al6, bh4) | 0;
          mid = mid + Math.imul(ah6, bl4) | 0;
          hi = hi + Math.imul(ah6, bh4) | 0;
          lo = lo + Math.imul(al5, bl5) | 0;
          mid = mid + Math.imul(al5, bh5) | 0;
          mid = mid + Math.imul(ah5, bl5) | 0;
          hi = hi + Math.imul(ah5, bh5) | 0;
          lo = lo + Math.imul(al4, bl6) | 0;
          mid = mid + Math.imul(al4, bh6) | 0;
          mid = mid + Math.imul(ah4, bl6) | 0;
          hi = hi + Math.imul(ah4, bh6) | 0;
          lo = lo + Math.imul(al3, bl7) | 0;
          mid = mid + Math.imul(al3, bh7) | 0;
          mid = mid + Math.imul(ah3, bl7) | 0;
          hi = hi + Math.imul(ah3, bh7) | 0;
          lo = lo + Math.imul(al2, bl8) | 0;
          mid = mid + Math.imul(al2, bh8) | 0;
          mid = mid + Math.imul(ah2, bl8) | 0;
          hi = hi + Math.imul(ah2, bh8) | 0;
          lo = lo + Math.imul(al1, bl9) | 0;
          mid = mid + Math.imul(al1, bh9) | 0;
          mid = mid + Math.imul(ah1, bl9) | 0;
          hi = hi + Math.imul(ah1, bh9) | 0;
          var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
          w10 &= 0x3ffffff;
          /* k = 11 */
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = mid + Math.imul(ah9, bl2) | 0;
          hi = Math.imul(ah9, bh2);
          lo = lo + Math.imul(al8, bl3) | 0;
          mid = mid + Math.imul(al8, bh3) | 0;
          mid = mid + Math.imul(ah8, bl3) | 0;
          hi = hi + Math.imul(ah8, bh3) | 0;
          lo = lo + Math.imul(al7, bl4) | 0;
          mid = mid + Math.imul(al7, bh4) | 0;
          mid = mid + Math.imul(ah7, bl4) | 0;
          hi = hi + Math.imul(ah7, bh4) | 0;
          lo = lo + Math.imul(al6, bl5) | 0;
          mid = mid + Math.imul(al6, bh5) | 0;
          mid = mid + Math.imul(ah6, bl5) | 0;
          hi = hi + Math.imul(ah6, bh5) | 0;
          lo = lo + Math.imul(al5, bl6) | 0;
          mid = mid + Math.imul(al5, bh6) | 0;
          mid = mid + Math.imul(ah5, bl6) | 0;
          hi = hi + Math.imul(ah5, bh6) | 0;
          lo = lo + Math.imul(al4, bl7) | 0;
          mid = mid + Math.imul(al4, bh7) | 0;
          mid = mid + Math.imul(ah4, bl7) | 0;
          hi = hi + Math.imul(ah4, bh7) | 0;
          lo = lo + Math.imul(al3, bl8) | 0;
          mid = mid + Math.imul(al3, bh8) | 0;
          mid = mid + Math.imul(ah3, bl8) | 0;
          hi = hi + Math.imul(ah3, bh8) | 0;
          lo = lo + Math.imul(al2, bl9) | 0;
          mid = mid + Math.imul(al2, bh9) | 0;
          mid = mid + Math.imul(ah2, bl9) | 0;
          hi = hi + Math.imul(ah2, bh9) | 0;
          var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
          w11 &= 0x3ffffff;
          /* k = 12 */
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = mid + Math.imul(ah9, bl3) | 0;
          hi = Math.imul(ah9, bh3);
          lo = lo + Math.imul(al8, bl4) | 0;
          mid = mid + Math.imul(al8, bh4) | 0;
          mid = mid + Math.imul(ah8, bl4) | 0;
          hi = hi + Math.imul(ah8, bh4) | 0;
          lo = lo + Math.imul(al7, bl5) | 0;
          mid = mid + Math.imul(al7, bh5) | 0;
          mid = mid + Math.imul(ah7, bl5) | 0;
          hi = hi + Math.imul(ah7, bh5) | 0;
          lo = lo + Math.imul(al6, bl6) | 0;
          mid = mid + Math.imul(al6, bh6) | 0;
          mid = mid + Math.imul(ah6, bl6) | 0;
          hi = hi + Math.imul(ah6, bh6) | 0;
          lo = lo + Math.imul(al5, bl7) | 0;
          mid = mid + Math.imul(al5, bh7) | 0;
          mid = mid + Math.imul(ah5, bl7) | 0;
          hi = hi + Math.imul(ah5, bh7) | 0;
          lo = lo + Math.imul(al4, bl8) | 0;
          mid = mid + Math.imul(al4, bh8) | 0;
          mid = mid + Math.imul(ah4, bl8) | 0;
          hi = hi + Math.imul(ah4, bh8) | 0;
          lo = lo + Math.imul(al3, bl9) | 0;
          mid = mid + Math.imul(al3, bh9) | 0;
          mid = mid + Math.imul(ah3, bl9) | 0;
          hi = hi + Math.imul(ah3, bh9) | 0;
          var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
          w12 &= 0x3ffffff;
          /* k = 13 */
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = mid + Math.imul(ah9, bl4) | 0;
          hi = Math.imul(ah9, bh4);
          lo = lo + Math.imul(al8, bl5) | 0;
          mid = mid + Math.imul(al8, bh5) | 0;
          mid = mid + Math.imul(ah8, bl5) | 0;
          hi = hi + Math.imul(ah8, bh5) | 0;
          lo = lo + Math.imul(al7, bl6) | 0;
          mid = mid + Math.imul(al7, bh6) | 0;
          mid = mid + Math.imul(ah7, bl6) | 0;
          hi = hi + Math.imul(ah7, bh6) | 0;
          lo = lo + Math.imul(al6, bl7) | 0;
          mid = mid + Math.imul(al6, bh7) | 0;
          mid = mid + Math.imul(ah6, bl7) | 0;
          hi = hi + Math.imul(ah6, bh7) | 0;
          lo = lo + Math.imul(al5, bl8) | 0;
          mid = mid + Math.imul(al5, bh8) | 0;
          mid = mid + Math.imul(ah5, bl8) | 0;
          hi = hi + Math.imul(ah5, bh8) | 0;
          lo = lo + Math.imul(al4, bl9) | 0;
          mid = mid + Math.imul(al4, bh9) | 0;
          mid = mid + Math.imul(ah4, bl9) | 0;
          hi = hi + Math.imul(ah4, bh9) | 0;
          var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
          w13 &= 0x3ffffff;
          /* k = 14 */
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = mid + Math.imul(ah9, bl5) | 0;
          hi = Math.imul(ah9, bh5);
          lo = lo + Math.imul(al8, bl6) | 0;
          mid = mid + Math.imul(al8, bh6) | 0;
          mid = mid + Math.imul(ah8, bl6) | 0;
          hi = hi + Math.imul(ah8, bh6) | 0;
          lo = lo + Math.imul(al7, bl7) | 0;
          mid = mid + Math.imul(al7, bh7) | 0;
          mid = mid + Math.imul(ah7, bl7) | 0;
          hi = hi + Math.imul(ah7, bh7) | 0;
          lo = lo + Math.imul(al6, bl8) | 0;
          mid = mid + Math.imul(al6, bh8) | 0;
          mid = mid + Math.imul(ah6, bl8) | 0;
          hi = hi + Math.imul(ah6, bh8) | 0;
          lo = lo + Math.imul(al5, bl9) | 0;
          mid = mid + Math.imul(al5, bh9) | 0;
          mid = mid + Math.imul(ah5, bl9) | 0;
          hi = hi + Math.imul(ah5, bh9) | 0;
          var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
          w14 &= 0x3ffffff;
          /* k = 15 */
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = mid + Math.imul(ah9, bl6) | 0;
          hi = Math.imul(ah9, bh6);
          lo = lo + Math.imul(al8, bl7) | 0;
          mid = mid + Math.imul(al8, bh7) | 0;
          mid = mid + Math.imul(ah8, bl7) | 0;
          hi = hi + Math.imul(ah8, bh7) | 0;
          lo = lo + Math.imul(al7, bl8) | 0;
          mid = mid + Math.imul(al7, bh8) | 0;
          mid = mid + Math.imul(ah7, bl8) | 0;
          hi = hi + Math.imul(ah7, bh8) | 0;
          lo = lo + Math.imul(al6, bl9) | 0;
          mid = mid + Math.imul(al6, bh9) | 0;
          mid = mid + Math.imul(ah6, bl9) | 0;
          hi = hi + Math.imul(ah6, bh9) | 0;
          var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
          w15 &= 0x3ffffff;
          /* k = 16 */
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = mid + Math.imul(ah9, bl7) | 0;
          hi = Math.imul(ah9, bh7);
          lo = lo + Math.imul(al8, bl8) | 0;
          mid = mid + Math.imul(al8, bh8) | 0;
          mid = mid + Math.imul(ah8, bl8) | 0;
          hi = hi + Math.imul(ah8, bh8) | 0;
          lo = lo + Math.imul(al7, bl9) | 0;
          mid = mid + Math.imul(al7, bh9) | 0;
          mid = mid + Math.imul(ah7, bl9) | 0;
          hi = hi + Math.imul(ah7, bh9) | 0;
          var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
          w16 &= 0x3ffffff;
          /* k = 17 */
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = mid + Math.imul(ah9, bl8) | 0;
          hi = Math.imul(ah9, bh8);
          lo = lo + Math.imul(al8, bl9) | 0;
          mid = mid + Math.imul(al8, bh9) | 0;
          mid = mid + Math.imul(ah8, bl9) | 0;
          hi = hi + Math.imul(ah8, bh9) | 0;
          var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
          w17 &= 0x3ffffff;
          /* k = 18 */
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = mid + Math.imul(ah9, bl9) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
          w18 &= 0x3ffffff;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };

        // Polyfill comb
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }

        function bigMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          out.length = self.length + num.length;

          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;

              var lo = r & 0x3ffffff;
              ncarry = ncarry + (r / 0x4000000 | 0) | 0;
              lo = lo + rword | 0;
              rword = lo & 0x3ffffff;
              ncarry = ncarry + (lo >>> 26) | 0;

              hncarry += ncarry >>> 26;
              ncarry &= 0x3ffffff;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }

          return out.strip();
        }

        function jumboMulTo(self, num, out) {
          var fftm = new FFTM();
          return fftm.mulp(self, num, out);
        }

        BN.prototype.mulTo = function mulTo(num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }

          return res;
        };

        // Cooley-Tukey algorithm for FFT
        // slightly revisited to rely on looping instead of recursion

        function FFTM(x, y) {
          this.x = x;
          this.y = y;
        }

        FFTM.prototype.makeRBT = function makeRBT(N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }

          return t;
        };

        // Returns binary-reversed representation of `x`
        FFTM.prototype.revBin = function revBin(x, l, N) {
          if (x === 0 || x === N - 1) return x;

          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
          }

          return rb;
        };

        // Performs "tweedling" phase, therefore 'emulating'
        // behaviour of the recursive algorithm
        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };

        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);

          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;

            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);

            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;

              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];

                var ro = rtws[p + j + s];
                var io = itws[p + j + s];

                var rx = rtwdf_ * ro - itwdf_ * io;

                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;

                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;

                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;

                /* jshint maxdepth : false */
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;

                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };

        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }

          return 1 << i + 1 + odd;
        };

        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
          if (N <= 1) return;

          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];

            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;

            t = iws[i];

            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };

        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;

            ws[i] = w & 0x3ffffff;

            if (w < 0x4000000) {
              carry = 0;
            } else {
              carry = w / 0x4000000 | 0;
            }
          }

          return ws;
        };

        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);

            rws[2 * i] = carry & 0x1fff;carry = carry >>> 13;
            rws[2 * i + 1] = carry & 0x1fff;carry = carry >>> 13;
          }

          // Pad with zeroes
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }

          assert(carry === 0);
          assert((carry & ~0x1fff) === 0);
        };

        FFTM.prototype.stub = function stub(N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }

          return ph;
        };

        FFTM.prototype.mulp = function mulp(x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);

          var rbt = this.makeRBT(N);

          var _ = this.stub(N);

          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);

          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);

          var rmws = out.words;
          rmws.length = N;

          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);

          this.transform(rws, _, rwst, iwst, N, rbt);
          this.transform(nrws, _, nrwst, niwst, N, rbt);

          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }

          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _, N, rbt);
          this.conjugate(rmws, _, N);
          this.normalize13b(rmws, N);

          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out.strip();
        };

        // Multiply `this` by `num`
        BN.prototype.mul = function mul(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };

        // Multiply employing FFT
        BN.prototype.mulf = function mulf(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };

        // In-place Multiplication
        BN.prototype.imul = function imul(num) {
          return this.clone().mulTo(num, this);
        };

        BN.prototype.imuln = function imuln(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);

          // Carry
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
            carry >>= 26;
            carry += w / 0x4000000 | 0;
            // NOTE: lo is 27bit maximum
            carry += lo >>> 26;
            this.words[i] = lo & 0x3ffffff;
          }

          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }

          return this;
        };

        BN.prototype.muln = function muln(num) {
          return this.clone().imuln(num);
        };

        // `this` * `this`
        BN.prototype.sqr = function sqr() {
          return this.mul(this);
        };

        // `this` * `this` in-place
        BN.prototype.isqr = function isqr() {
          return this.imul(this.clone());
        };

        // Math.pow(`this`, `num`)
        BN.prototype.pow = function pow(num) {
          var w = toBitArray(num);
          if (w.length === 0) return new BN(1);

          // Skip leading zeroes
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0) break;
          }

          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0) continue;

              res = res.mul(q);
            }
          }

          return res;
        };

        // Shift-left in-place
        BN.prototype.iushln = function iushln(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
          var i;

          if (r !== 0) {
            var carry = 0;

            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = (this.words[i] | 0) - newCarry << r;
              this.words[i] = c | carry;
              carry = newCarry >>> 26 - r;
            }

            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }

          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }

            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }

            this.length += s;
          }

          return this.strip();
        };

        BN.prototype.ishln = function ishln(bits) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushln(bits);
        };

        // Shift-right in-place
        // NOTE: `hint` is a lowest bit before trailing zeroes
        // NOTE: if `extended` is present - it will be filled with destroyed bits
        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
          assert(typeof bits === 'number' && bits >= 0);
          var h;
          if (hint) {
            h = (hint - hint % 26) / 26;
          } else {
            h = 0;
          }

          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
          var maskedWords = extended;

          h -= s;
          h = Math.max(0, h);

          // Extended mode, copy masked part
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }

          if (s === 0) {
            // No-op, we should not move anything at all
          } else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }

          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
          }

          // Push carried bits as a mask
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }

          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }

          return this.strip();
        };

        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };

        // Shift-left
        BN.prototype.shln = function shln(bits) {
          return this.clone().ishln(bits);
        };

        BN.prototype.ushln = function ushln(bits) {
          return this.clone().iushln(bits);
        };

        // Shift-right
        BN.prototype.shrn = function shrn(bits) {
          return this.clone().ishrn(bits);
        };

        BN.prototype.ushrn = function ushrn(bits) {
          return this.clone().iushrn(bits);
        };

        // Test if n bit is set
        BN.prototype.testn = function testn(bit) {
          assert(typeof bit === 'number' && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) return false;

          // Check bit and return
          var w = this.words[s];

          return !!(w & q);
        };

        // Return only lowers bits of number (in-place)
        BN.prototype.imaskn = function imaskn(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;

          assert(this.negative === 0, 'imaskn works only with positive numbers');

          if (this.length <= s) {
            return this;
          }

          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);

          if (r !== 0) {
            var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
            this.words[this.length - 1] &= mask;
          }

          return this.strip();
        };

        // Return only lowers bits of number
        BN.prototype.maskn = function maskn(bits) {
          return this.clone().imaskn(bits);
        };

        // Add plain number `num` to `this`
        BN.prototype.iaddn = function iaddn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.isubn(-num);

          // Possible sign change
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) < num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }

            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }

          // Add without checks
          return this._iaddn(num);
        };

        BN.prototype._iaddn = function _iaddn(num) {
          this.words[0] += num;

          // Carry
          for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
            this.words[i] -= 0x4000000;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);

          return this;
        };

        // Subtract plain number `num` from `this`
        BN.prototype.isubn = function isubn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.iaddn(-num);

          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }

          this.words[0] -= num;

          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            // Carry
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 0x4000000;
              this.words[i + 1] -= 1;
            }
          }

          return this.strip();
        };

        BN.prototype.addn = function addn(num) {
          return this.clone().iaddn(num);
        };

        BN.prototype.subn = function subn(num) {
          return this.clone().isubn(num);
        };

        BN.prototype.iabs = function iabs() {
          this.negative = 0;

          return this;
        };

        BN.prototype.abs = function abs() {
          return this.clone().iabs();
        };

        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
          var len = num.length + shift;
          var i;

          this._expand(len);

          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 0x3ffffff;
            carry = (w >> 26) - (right / 0x4000000 | 0);
            this.words[i + shift] = w & 0x3ffffff;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 0x3ffffff;
          }

          if (carry === 0) return this.strip();

          // Subtraction overflow
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 0x3ffffff;
          }
          this.negative = 1;

          return this.strip();
        };

        BN.prototype._wordDiv = function _wordDiv(num, mode) {
          var shift = this.length - num.length;

          var a = this.clone();
          var b = num;

          // Normalize
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }

          // Initialize quotient
          var m = a.length - b.length;
          var q;

          if (mode !== 'mod') {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }

          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }

          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0);

            // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
            // (0x7ffffff)
            qj = Math.min(qj / bhi | 0, 0x3ffffff);

            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q.strip();
          }
          a.strip();

          // Denormalize
          if (mode !== 'div' && shift !== 0) {
            a.iushrn(shift);
          }

          return {
            div: q || null,
            mod: a
          };
        };

        // NOTE: 1) `mode` can be set to `mod` to request mod only,
        //       to `div` to request div only, or be absent to
        //       request both div & mod
        //       2) `positive` is true if unsigned mod is requested
        BN.prototype.divmod = function divmod(num, mode, positive) {
          assert(!num.isZero());

          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }

          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }

            return {
              div: div,
              mod: mod
            };
          }

          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            return {
              div: div,
              mod: res.mod
            };
          }

          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }

            return {
              div: res.div,
              mod: mod
            };
          }

          // Both numbers are positive at this point

          // Strip both numbers to approximate shift value
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }

          // Very short reduction
          if (num.length === 1) {
            if (mode === 'div') {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }

            if (mode === 'mod') {
              return {
                div: null,
                mod: new BN(this.modn(num.words[0]))
              };
            }

            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modn(num.words[0]))
            };
          }

          return this._wordDiv(num, mode);
        };

        // Find `this` / `num`
        BN.prototype.div = function div(num) {
          return this.divmod(num, 'div', false).div;
        };

        // Find `this` % `num`
        BN.prototype.mod = function mod(num) {
          return this.divmod(num, 'mod', false).mod;
        };

        BN.prototype.umod = function umod(num) {
          return this.divmod(num, 'mod', true).mod;
        };

        // Find Round(`this` / `num`)
        BN.prototype.divRound = function divRound(num) {
          var dm = this.divmod(num);

          // Fast case - exact division
          if (dm.mod.isZero()) return dm.div;

          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);

          // Round down
          if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

          // Round up
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };

        BN.prototype.modn = function modn(num) {
          assert(num <= 0x3ffffff);
          var p = (1 << 26) % num;

          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }

          return acc;
        };

        // In-place division by number
        BN.prototype.idivn = function idivn(num) {
          assert(num <= 0x3ffffff);

          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 0x4000000;
            this.words[i] = w / num | 0;
            carry = w % num;
          }

          return this.strip();
        };

        BN.prototype.divn = function divn(num) {
          return this.clone().idivn(num);
        };

        BN.prototype.egcd = function egcd(p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var x = this;
          var y = p.clone();

          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }

          // A * x + B * y = x
          var A = new BN(1);
          var B = new BN(0);

          // C * x + D * y = y
          var C = new BN(0);
          var D = new BN(1);

          var g = 0;

          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }

          var yp = y.clone();
          var xp = x.clone();

          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }

                A.iushrn(1);
                B.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }

                C.iushrn(1);
                D.iushrn(1);
              }
            }

            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }

          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };

        // This is reduced incarnation of the binary EEA
        // above, designated to invert members of the
        // _prime_ fields F(p) at a maximal speed
        BN.prototype._invmp = function _invmp(p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var a = this;
          var b = p.clone();

          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }

          var x1 = new BN(1);
          var x2 = new BN(0);

          var delta = b.clone();

          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) {}
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }

                x1.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) {}
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }

                x2.iushrn(1);
              }
            }

            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }

          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }

          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }

          return res;
        };

        BN.prototype.gcd = function gcd(num) {
          if (this.isZero()) return num.abs();
          if (num.isZero()) return this.abs();

          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;

          // Remove common factor of two
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }

          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }

            var r = a.cmp(b);
            if (r < 0) {
              // Swap `a` and `b` to make `a` always bigger than `b`
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }

            a.isub(b);
          } while (true);

          return b.iushln(shift);
        };

        // Invert number in the field F(num)
        BN.prototype.invm = function invm(num) {
          return this.egcd(num).a.umod(num);
        };

        BN.prototype.isEven = function isEven() {
          return (this.words[0] & 1) === 0;
        };

        BN.prototype.isOdd = function isOdd() {
          return (this.words[0] & 1) === 1;
        };

        // And first word and num
        BN.prototype.andln = function andln(num) {
          return this.words[0] & num;
        };

        // Increment at the bit position in-line
        BN.prototype.bincn = function bincn(bit) {
          assert(typeof bit === 'number');
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }

          // Add bit and propagate, if needed
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 0x3ffffff;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };

        BN.prototype.isZero = function isZero() {
          return this.length === 1 && this.words[0] === 0;
        };

        BN.prototype.cmpn = function cmpn(num) {
          var negative = num < 0;

          if (this.negative !== 0 && !negative) return -1;
          if (this.negative === 0 && negative) return 1;

          this.strip();

          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }

            assert(num <= 0x3ffffff, 'Number is too big');

            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Compare two numbers and return:
        // 1 - if `this` > `num`
        // 0 - if `this` == `num`
        // -1 - if `this` < `num`
        BN.prototype.cmp = function cmp(num) {
          if (this.negative !== 0 && num.negative === 0) return -1;
          if (this.negative === 0 && num.negative !== 0) return 1;

          var res = this.ucmp(num);
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Unsigned comparison
        BN.prototype.ucmp = function ucmp(num) {
          // At this point both numbers have the same sign
          if (this.length > num.length) return 1;
          if (this.length < num.length) return -1;

          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;

            if (a === b) continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };

        BN.prototype.gtn = function gtn(num) {
          return this.cmpn(num) === 1;
        };

        BN.prototype.gt = function gt(num) {
          return this.cmp(num) === 1;
        };

        BN.prototype.gten = function gten(num) {
          return this.cmpn(num) >= 0;
        };

        BN.prototype.gte = function gte(num) {
          return this.cmp(num) >= 0;
        };

        BN.prototype.ltn = function ltn(num) {
          return this.cmpn(num) === -1;
        };

        BN.prototype.lt = function lt(num) {
          return this.cmp(num) === -1;
        };

        BN.prototype.lten = function lten(num) {
          return this.cmpn(num) <= 0;
        };

        BN.prototype.lte = function lte(num) {
          return this.cmp(num) <= 0;
        };

        BN.prototype.eqn = function eqn(num) {
          return this.cmpn(num) === 0;
        };

        BN.prototype.eq = function eq(num) {
          return this.cmp(num) === 0;
        };

        //
        // A reduce context, could be using montgomery or something better, depending
        // on the `m` itself.
        //
        BN.red = function red(num) {
          return new Red(num);
        };

        BN.prototype.toRed = function toRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          assert(this.negative === 0, 'red works only with positives');
          return ctx.convertTo(this)._forceRed(ctx);
        };

        BN.prototype.fromRed = function fromRed() {
          assert(this.red, 'fromRed works only with numbers in reduction context');
          return this.red.convertFrom(this);
        };

        BN.prototype._forceRed = function _forceRed(ctx) {
          this.red = ctx;
          return this;
        };

        BN.prototype.forceRed = function forceRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          return this._forceRed(ctx);
        };

        BN.prototype.redAdd = function redAdd(num) {
          assert(this.red, 'redAdd works only with red numbers');
          return this.red.add(this, num);
        };

        BN.prototype.redIAdd = function redIAdd(num) {
          assert(this.red, 'redIAdd works only with red numbers');
          return this.red.iadd(this, num);
        };

        BN.prototype.redSub = function redSub(num) {
          assert(this.red, 'redSub works only with red numbers');
          return this.red.sub(this, num);
        };

        BN.prototype.redISub = function redISub(num) {
          assert(this.red, 'redISub works only with red numbers');
          return this.red.isub(this, num);
        };

        BN.prototype.redShl = function redShl(num) {
          assert(this.red, 'redShl works only with red numbers');
          return this.red.shl(this, num);
        };

        BN.prototype.redMul = function redMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };

        BN.prototype.redIMul = function redIMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };

        BN.prototype.redSqr = function redSqr() {
          assert(this.red, 'redSqr works only with red numbers');
          this.red._verify1(this);
          return this.red.sqr(this);
        };

        BN.prototype.redISqr = function redISqr() {
          assert(this.red, 'redISqr works only with red numbers');
          this.red._verify1(this);
          return this.red.isqr(this);
        };

        // Square root over p
        BN.prototype.redSqrt = function redSqrt() {
          assert(this.red, 'redSqrt works only with red numbers');
          this.red._verify1(this);
          return this.red.sqrt(this);
        };

        BN.prototype.redInvm = function redInvm() {
          assert(this.red, 'redInvm works only with red numbers');
          this.red._verify1(this);
          return this.red.invm(this);
        };

        // Return negative clone of `this` % `red modulo`
        BN.prototype.redNeg = function redNeg() {
          assert(this.red, 'redNeg works only with red numbers');
          this.red._verify1(this);
          return this.red.neg(this);
        };

        BN.prototype.redPow = function redPow(num) {
          assert(this.red && !num.red, 'redPow(normalNum)');
          this.red._verify1(this);
          return this.red.pow(this, num);
        };

        // Prime numbers with efficient reduction
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };

        // Pseudo-Mersenne prime
        function MPrime(name, p) {
          // P = 2 ^ N - K
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);

          this.tmp = this._tmp();
        }

        MPrime.prototype._tmp = function _tmp() {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };

        MPrime.prototype.ireduce = function ireduce(num) {
          // Assumes that `num` is less than `P^2`
          // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
          var r = num;
          var rlen;

          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);

          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            r.strip();
          }

          return r;
        };

        MPrime.prototype.split = function split(input, out) {
          input.iushrn(this.n, 0, out);
        };

        MPrime.prototype.imulK = function imulK(num) {
          return num.imul(this.k);
        };

        function K256() {
          MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
        }
        inherits(K256, MPrime);

        K256.prototype.split = function split(input, output) {
          // 256 = 9 * 26 + 22
          var mask = 0x3fffff;

          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;

          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }

          // Shift by 9 limbs
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;

          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };

        K256.prototype.imulK = function imulK(num) {
          // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;

          // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 0x3d1;
            num.words[i] = lo & 0x3ffffff;
            lo = w * 0x40 + (lo / 0x4000000 | 0);
          }

          // Fast length reduction
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };

        function P224() {
          MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
        }
        inherits(P224, MPrime);

        function P192() {
          MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
        }
        inherits(P192, MPrime);

        function P25519() {
          // 2 ^ 255 - 19
          MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
        }
        inherits(P25519, MPrime);

        P25519.prototype.imulK = function imulK(num) {
          // K = 0x13
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 0x13 + carry;
            var lo = hi & 0x3ffffff;
            hi >>>= 26;

            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };

        // Exported mostly for testing purposes, use plain name instead
        BN._prime = function prime(name) {
          // Cached version of prime
          if (primes[name]) return primes[name];

          var prime;
          if (name === 'k256') {
            prime = new K256();
          } else if (name === 'p224') {
            prime = new P224();
          } else if (name === 'p192') {
            prime = new P192();
          } else if (name === 'p25519') {
            prime = new P25519();
          } else {
            throw new Error('Unknown prime ' + name);
          }
          primes[name] = prime;

          return prime;
        };

        //
        // Base reduction engine
        //
        function Red(m) {
          if (typeof m === 'string') {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), 'modulus must be greater than 1');
            this.m = m;
            this.prime = null;
          }
        }

        Red.prototype._verify1 = function _verify1(a) {
          assert(a.negative === 0, 'red works only with positives');
          assert(a.red, 'red works only with red numbers');
        };

        Red.prototype._verify2 = function _verify2(a, b) {
          assert((a.negative | b.negative) === 0, 'red works only with positives');
          assert(a.red && a.red === b.red, 'red works only with red numbers');
        };

        Red.prototype.imod = function imod(a) {
          if (this.prime) return this.prime.ireduce(a)._forceRed(this);
          return a.umod(this.m)._forceRed(this);
        };

        Red.prototype.neg = function neg(a) {
          if (a.isZero()) {
            return a.clone();
          }

          return this.m.sub(a)._forceRed(this);
        };

        Red.prototype.add = function add(a, b) {
          this._verify2(a, b);

          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.iadd = function iadd(a, b) {
          this._verify2(a, b);

          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };

        Red.prototype.sub = function sub(a, b) {
          this._verify2(a, b);

          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.isub = function isub(a, b) {
          this._verify2(a, b);

          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };

        Red.prototype.shl = function shl(a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };

        Red.prototype.imul = function imul(a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };

        Red.prototype.mul = function mul(a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };

        Red.prototype.isqr = function isqr(a) {
          return this.imul(a, a.clone());
        };

        Red.prototype.sqr = function sqr(a) {
          return this.mul(a, a);
        };

        Red.prototype.sqrt = function sqrt(a) {
          if (a.isZero()) return a.clone();

          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);

          // Fast case
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }

          // Tonelli-Shanks algorithm (Totally unoptimized and slow)
          //
          // Find Q and S, that Q * 2 ^ S = (P - 1)
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());

          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();

          // Find quadratic non-residue
          // NOTE: Max is such because of generalized Riemann hypothesis.
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);

          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }

          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));

            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }

          return r;
        };

        Red.prototype.invm = function invm(a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };

        Red.prototype.pow = function pow(a, num) {
          if (num.isZero()) return new BN(1).toRed(this);
          if (num.cmpn(1) === 0) return a.clone();

          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }

          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }

          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = word >> j & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }

              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }

              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }

          return res;
        };

        Red.prototype.convertTo = function convertTo(num) {
          var r = num.umod(this.m);

          return r === num ? r.clone() : r;
        };

        Red.prototype.convertFrom = function convertFrom(num) {
          var res = num.clone();
          res.red = null;
          return res;
        };

        //
        // Montgomery method engine
        //

        BN.mont = function mont(num) {
          return new Mont(num);
        };

        function Mont(m) {
          Red.call(this, m);

          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }

          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);

          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);

        Mont.prototype.convertTo = function convertTo(num) {
          return this.imod(num.ushln(this.shift));
        };

        Mont.prototype.convertFrom = function convertFrom(num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };

        Mont.prototype.imul = function imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }

          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;

          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.mul = function mul(a, b) {
          if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.invm = function invm(a) {
          // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })(typeof module === 'undefined' || module, this);
    }, { "buffer": 5 }], "Web3Shh": [function (require, module, exports) {
      /*
          This file is part of web3.js.
      
          web3.js is free software: you can redistribute it and/or modify
          it under the terms of the GNU Lesser General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
      
          web3.js is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU Lesser General Public License for more details.
      
          You should have received a copy of the GNU Lesser General Public License
          along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
      */
      /**
       * @file index.js
       * @author Fabian Vogelsteller <fabian@ethereum.org>
       * @date 2017
       */

      "use strict";

      var core = require('../../web3-core');
      var Subscriptions = require('../../web3-core-subscriptions').subscriptions;
      var Method = require('../../web3-core-method');
      // var formatters = require('web3-core-helpers').formatters;
      var Net = require('../../web3-net');

      var Shh = function Shh() {
        var _this = this;

        // sets _requestmanager
        core.packageInit(this, arguments);

        // overwrite setProvider
        var setProvider = this.setProvider;
        this.setProvider = function () {
          setProvider.apply(_this, arguments);
          _this.net.setProvider.apply(_this, arguments);
        };

        this.net = new Net(this.currentProvider);

        [new Subscriptions({
          name: 'subscribe',
          type: 'shh',
          subscriptions: {
            'messages': {
              params: 1
              // inputFormatter: [formatters.inputPostFormatter],
              // outputFormatter: formatters.outputPostFormatter
            }
          }
        }), new Method({
          name: 'getVersion',
          call: 'shh_version',
          params: 0
        }), new Method({
          name: 'getInfo',
          call: 'shh_info',
          params: 0
        }), new Method({
          name: 'setMaxMessageSize',
          call: 'shh_setMaxMessageSize',
          params: 1
        }), new Method({
          name: 'setMinPoW',
          call: 'shh_setMinPoW',
          params: 1
        }), new Method({
          name: 'markTrustedPeer',
          call: 'shh_markTrustedPeer',
          params: 1
        }), new Method({
          name: 'newKeyPair',
          call: 'shh_newKeyPair',
          params: 0
        }), new Method({
          name: 'addPrivateKey',
          call: 'shh_addPrivateKey',
          params: 1
        }), new Method({
          name: 'deleteKeyPair',
          call: 'shh_deleteKeyPair',
          params: 1
        }), new Method({
          name: 'hasKeyPair',
          call: 'shh_hasKeyPair',
          params: 1
        }), new Method({
          name: 'getPublicKey',
          call: 'shh_getPublicKey',
          params: 1
        }), new Method({
          name: 'getPrivateKey',
          call: 'shh_getPrivateKey',
          params: 1
        }), new Method({
          name: 'newSymKey',
          call: 'shh_newSymKey',
          params: 0
        }), new Method({
          name: 'addSymKey',
          call: 'shh_addSymKey',
          params: 1
        }), new Method({
          name: 'generateSymKeyFromPassword',
          call: 'shh_generateSymKeyFromPassword',
          params: 1
        }), new Method({
          name: 'hasSymKey',
          call: 'shh_hasSymKey',
          params: 1
        }), new Method({
          name: 'getSymKey',
          call: 'shh_getSymKey',
          params: 1
        }), new Method({
          name: 'deleteSymKey',
          call: 'shh_deleteSymKey',
          params: 1
        }), new Method({
          name: 'newMessageFilter',
          call: 'shh_newMessageFilter',
          params: 1
        }), new Method({
          name: 'getFilterMessages',
          call: 'shh_getFilterMessages',
          params: 1
        }), new Method({
          name: 'deleteMessageFilter',
          call: 'shh_deleteMessageFilter',
          params: 1
        }), new Method({
          name: 'post',
          call: 'shh_post',
          params: 1,
          inputFormatter: [null]
        }), new Method({
          name: 'unsubscribe',
          call: 'shh_unsubscribe',
          params: 1
        })].forEach(function (method) {
          method.attachToObject(_this);
          method.setRequestManager(_this._requestManager);
        });
      };

      Shh.prototype.clearSubscriptions = function () {
        this._requestManager.clearSubscriptions();
      };

      core.addProviders(Shh);

      module.exports = Shh;
    }, { "../../web3-core": 80, "../../web3-core-method": 71, "../../web3-core-subscriptions": 77, "../../web3-net": 82 }] }, {}, ["Web3Shh"])("Web3Shh");
});
//# sourceMappingURL=web3-shh.js.map