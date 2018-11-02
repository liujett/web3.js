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
    }g.Web3Bzz = f();
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
  }()({ 1: [function (require, module, exports) {}, {}], 2: [function (require, module, exports) {
      'use strict';

      var token = '%[a-f0-9]{2}';
      var singleMatcher = new RegExp(token, 'gi');
      var multiMatcher = new RegExp('(' + token + ')+', 'gi');

      function decodeComponents(components, split) {
        try {
          // Try to decode the entire string first
          return decodeURIComponent(components.join(''));
        } catch (err) {
          // Do nothing
        }

        if (components.length === 1) {
          return components;
        }

        split = split || 1;

        // Split the array in 2 parts
        var left = components.slice(0, split);
        var right = components.slice(split);

        return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
      }

      function decode(input) {
        try {
          return decodeURIComponent(input);
        } catch (err) {
          var tokens = input.match(singleMatcher);

          for (var i = 1; i < tokens.length; i++) {
            input = decodeComponents(tokens, i).join('');

            tokens = input.match(singleMatcher);
          }

          return input;
        }
      }

      function customDecodeURIComponent(input) {
        // Keep track of all the replacements and prefill the map with the `BOM`
        var replaceMap = {
          '%FE%FF': "\uFFFD\uFFFD",
          '%FF%FE': "\uFFFD\uFFFD"
        };

        var match = multiMatcher.exec(input);
        while (match) {
          try {
            // Decode as big chunks as possible
            replaceMap[match[0]] = decodeURIComponent(match[0]);
          } catch (err) {
            var result = decode(match[0]);

            if (result !== match[0]) {
              replaceMap[match[0]] = result;
            }
          }

          match = multiMatcher.exec(input);
        }

        // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
        replaceMap['%C2'] = "\uFFFD";

        var entries = Object.keys(replaceMap);

        for (var i = 0; i < entries.length; i++) {
          // Replace all decoded components
          var key = entries[i];
          input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
        }

        return input;
      }

      module.exports = function (encodedURI) {
        if (typeof encodedURI !== 'string') {
          throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + (typeof encodedURI === "undefined" ? "undefined" : _typeof(encodedURI)) + '`');
        }

        try {
          encodedURI = encodedURI.replace(/\+/g, ' ');

          // Try the built in decoder first
          return decodeURIComponent(encodedURI);
        } catch (err) {
          // Fallback to a more advanced decoder
          return customDecodeURIComponent(encodedURI);
        }
      };
    }, {}], 3: [function (require, module, exports) {
      var generate = function generate(num, fn) {
        var a = [];
        for (var i = 0; i < num; ++i) {
          a.push(fn(i));
        }return a;
      };

      var replicate = function replicate(num, val) {
        return generate(num, function () {
          return val;
        });
      };

      var concat = function concat(a, b) {
        return a.concat(b);
      };

      var flatten = function flatten(a) {
        var r = [];
        for (var j = 0, J = a.length; j < J; ++j) {
          for (var i = 0, I = a[j].length; i < I; ++i) {
            r.push(a[j][i]);
          }
        }return r;
      };

      var chunksOf = function chunksOf(n, a) {
        var b = [];
        for (var i = 0, l = a.length; i < l; i += n) {
          b.push(a.slice(i, i + n));
        }return b;
      };

      module.exports = {
        generate: generate,
        replicate: replicate,
        concat: concat,
        flatten: flatten,
        chunksOf: chunksOf
      };
    }, {}], 4: [function (require, module, exports) {
      var A = require("./array.js");

      var at = function at(bytes, index) {
        return parseInt(bytes.slice(index * 2 + 2, index * 2 + 4), 16);
      };

      var random = function random(bytes) {
        var rnd = void 0;
        if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) rnd = window.crypto.getRandomValues(new Uint8Array(bytes));else if (typeof require !== "undefined") rnd = require("c" + "rypto").randomBytes(bytes);else throw "Safe random numbers not available.";
        var hex = "0x";
        for (var i = 0; i < bytes; ++i) {
          hex += ("00" + rnd[i].toString(16)).slice(-2);
        }return hex;
      };

      var length = function length(a) {
        return (a.length - 2) / 2;
      };

      var flatten = function flatten(a) {
        return "0x" + a.reduce(function (r, s) {
          return r + s.slice(2);
        }, "");
      };

      var slice = function slice(i, j, bs) {
        return "0x" + bs.slice(i * 2 + 2, j * 2 + 2);
      };

      var reverse = function reverse(hex) {
        var rev = "0x";
        for (var i = 0, l = length(hex); i < l; ++i) {
          rev += hex.slice((l - i) * 2, (l - i + 1) * 2);
        }
        return rev;
      };

      var pad = function pad(l, hex) {
        return hex.length === l * 2 + 2 ? hex : pad(l, "0x" + "0" + hex.slice(2));
      };

      var padRight = function padRight(l, hex) {
        return hex.length === l * 2 + 2 ? hex : padRight(l, hex + "0");
      };

      var toArray = function toArray(hex) {
        var arr = [];
        for (var i = 2, l = hex.length; i < l; i += 2) {
          arr.push(parseInt(hex.slice(i, i + 2), 16));
        }return arr;
      };

      var fromArray = function fromArray(arr) {
        var hex = "0x";
        for (var i = 0, l = arr.length; i < l; ++i) {
          var b = arr[i];
          hex += (b < 16 ? "0" : "") + b.toString(16);
        }
        return hex;
      };

      var toUint8Array = function toUint8Array(hex) {
        return new Uint8Array(toArray(hex));
      };

      var fromUint8Array = function fromUint8Array(arr) {
        return fromArray([].slice.call(arr, 0));
      };

      var fromNumber = function fromNumber(num) {
        var hex = num.toString(16);
        return hex.length % 2 === 0 ? "0x" + hex : "0x0" + hex;
      };

      var toNumber = function toNumber(hex) {
        return parseInt(hex.slice(2), 16);
      };

      var concat = function concat(a, b) {
        return a.concat(b.slice(2));
      };

      var fromNat = function fromNat(bn) {
        return bn === "0x0" ? "0x" : bn.length % 2 === 0 ? bn : "0x0" + bn.slice(2);
      };

      var toNat = function toNat(bn) {
        return bn[2] === "0" ? "0x" + bn.slice(3) : bn;
      };

      var fromAscii = function fromAscii(ascii) {
        var hex = "0x";
        for (var i = 0; i < ascii.length; ++i) {
          hex += ("00" + ascii.charCodeAt(i).toString(16)).slice(-2);
        }return hex;
      };

      var toAscii = function toAscii(hex) {
        var ascii = "";
        for (var i = 2; i < hex.length; i += 2) {
          ascii += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
        }return ascii;
      };

      // From https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
      var fromString = function fromString(s) {
        var makeByte = function makeByte(uint8) {
          var b = uint8.toString(16);
          return b.length < 2 ? "0" + b : b;
        };
        var bytes = "0x";
        for (var ci = 0; ci != s.length; ci++) {
          var c = s.charCodeAt(ci);
          if (c < 128) {
            bytes += makeByte(c);
            continue;
          }
          if (c < 2048) {
            bytes += makeByte(c >> 6 | 192);
          } else {
            if (c > 0xd7ff && c < 0xdc00) {
              if (++ci == s.length) return null;
              var c2 = s.charCodeAt(ci);
              if (c2 < 0xdc00 || c2 > 0xdfff) return null;
              c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
              bytes += makeByte(c >> 18 | 240);
              bytes += makeByte(c >> 12 & 63 | 128);
            } else {
              // c <= 0xffff
              bytes += makeByte(c >> 12 | 224);
            }
            bytes += makeByte(c >> 6 & 63 | 128);
          }
          bytes += makeByte(c & 63 | 128);
        }
        return bytes;
      };

      var toString = function toString(bytes) {
        var s = '';
        var i = 0;
        var l = length(bytes);
        while (i < l) {
          var c = at(bytes, i++);
          if (c > 127) {
            if (c > 191 && c < 224) {
              if (i >= l) return null;
              c = (c & 31) << 6 | at(bytes, i) & 63;
            } else if (c > 223 && c < 240) {
              if (i + 1 >= l) return null;
              c = (c & 15) << 12 | (at(bytes, i) & 63) << 6 | at(bytes, ++i) & 63;
            } else if (c > 239 && c < 248) {
              if (i + 2 >= l) return null;
              c = (c & 7) << 18 | (at(bytes, i) & 63) << 12 | (at(bytes, ++i) & 63) << 6 | at(bytes, ++i) & 63;
            } else return null;
            ++i;
          }
          if (c <= 0xffff) s += String.fromCharCode(c);else if (c <= 0x10ffff) {
            c -= 0x10000;
            s += String.fromCharCode(c >> 10 | 0xd800);
            s += String.fromCharCode(c & 0x3FF | 0xdc00);
          } else return null;
        }
        return s;
      };

      module.exports = {
        random: random,
        length: length,
        concat: concat,
        flatten: flatten,
        slice: slice,
        reverse: reverse,
        pad: pad,
        padRight: padRight,
        fromAscii: fromAscii,
        toAscii: toAscii,
        fromString: fromString,
        toString: toString,
        fromNumber: fromNumber,
        toNumber: toNumber,
        fromNat: fromNat,
        toNat: toNat,
        fromArray: fromArray,
        toArray: toArray,
        fromUint8Array: fromUint8Array,
        toUint8Array: toUint8Array
      };
    }, { "./array.js": 3 }], 5: [function (require, module, exports) {
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
    }, {}], 6: [function (require, module, exports) {
      'use strict';

      var isCallable = require('is-callable');

      var toStr = Object.prototype.toString;
      var hasOwnProperty = Object.prototype.hasOwnProperty;

      var forEachArray = function forEachArray(array, iterator, receiver) {
        for (var i = 0, len = array.length; i < len; i++) {
          if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
              iterator(array[i], i, array);
            } else {
              iterator.call(receiver, array[i], i, array);
            }
          }
        }
      };

      var forEachString = function forEachString(string, iterator, receiver) {
        for (var i = 0, len = string.length; i < len; i++) {
          // no such thing as a sparse string.
          if (receiver == null) {
            iterator(string.charAt(i), i, string);
          } else {
            iterator.call(receiver, string.charAt(i), i, string);
          }
        }
      };

      var forEachObject = function forEachObject(object, iterator, receiver) {
        for (var k in object) {
          if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
              iterator(object[k], k, object);
            } else {
              iterator.call(receiver, object[k], k, object);
            }
          }
        }
      };

      var forEach = function forEach(list, iterator, thisArg) {
        if (!isCallable(iterator)) {
          throw new TypeError('iterator must be a function');
        }

        var receiver;
        if (arguments.length >= 3) {
          receiver = thisArg;
        }

        if (toStr.call(list) === '[object Array]') {
          forEachArray(list, iterator, receiver);
        } else if (typeof list === 'string') {
          forEachString(list, iterator, receiver);
        } else {
          forEachObject(list, iterator, receiver);
        }
      };

      module.exports = forEach;
    }, { "is-callable": 8 }], 7: [function (require, module, exports) {
      (function (global) {
        var win;

        if (typeof window !== "undefined") {
          win = window;
        } else if (typeof global !== "undefined") {
          win = global;
        } else if (typeof self !== "undefined") {
          win = self;
        } else {
          win = {};
        }

        module.exports = win;
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 8: [function (require, module, exports) {
      'use strict';

      var fnToStr = Function.prototype.toString;

      var constructorRegex = /^\s*class\b/;
      var isES6ClassFn = function isES6ClassFunction(value) {
        try {
          var fnStr = fnToStr.call(value);
          return constructorRegex.test(fnStr);
        } catch (e) {
          return false; // not a function
        }
      };

      var tryFunctionObject = function tryFunctionToStr(value) {
        try {
          if (isES6ClassFn(value)) {
            return false;
          }
          fnToStr.call(value);
          return true;
        } catch (e) {
          return false;
        }
      };
      var toStr = Object.prototype.toString;
      var fnClass = '[object Function]';
      var genClass = '[object GeneratorFunction]';
      var hasToStringTag = typeof Symbol === 'function' && _typeof(Symbol.toStringTag) === 'symbol';

      module.exports = function isCallable(value) {
        if (!value) {
          return false;
        }
        if (typeof value !== 'function' && (typeof value === "undefined" ? "undefined" : _typeof(value)) !== 'object') {
          return false;
        }
        if (typeof value === 'function' && !value.prototype) {
          return true;
        }
        if (hasToStringTag) {
          return tryFunctionObject(value);
        }
        if (isES6ClassFn(value)) {
          return false;
        }
        var strClass = toStr.call(value);
        return strClass === fnClass || strClass === genClass;
      };
    }, {}], 9: [function (require, module, exports) {
      module.exports = isFunction;

      var toString = Object.prototype.toString;

      function isFunction(fn) {
        var string = toString.call(fn);
        return string === '[object Function]' || typeof fn === 'function' && string !== '[object RegExp]' || typeof window !== 'undefined' && (
        // IE8 and below
        fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt);
      };
    }, {}], 10: [function (require, module, exports) {
      /*
      object-assign
      (c) Sindre Sorhus
      @license MIT
      */

      'use strict';
      /* eslint-disable no-unused-vars */

      var getOwnPropertySymbols = Object.getOwnPropertySymbols;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;

      function toObject(val) {
        if (val === null || val === undefined) {
          throw new TypeError('Object.assign cannot be called with null or undefined');
        }

        return Object(val);
      }

      function shouldUseNative() {
        try {
          if (!Object.assign) {
            return false;
          }

          // Detect buggy property enumeration order in older V8 versions.

          // https://bugs.chromium.org/p/v8/issues/detail?id=4118
          var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
          test1[5] = 'de';
          if (Object.getOwnPropertyNames(test1)[0] === '5') {
            return false;
          }

          // https://bugs.chromium.org/p/v8/issues/detail?id=3056
          var test2 = {};
          for (var i = 0; i < 10; i++) {
            test2['_' + String.fromCharCode(i)] = i;
          }
          var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
            return test2[n];
          });
          if (order2.join('') !== '0123456789') {
            return false;
          }

          // https://bugs.chromium.org/p/v8/issues/detail?id=3056
          var test3 = {};
          'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
            test3[letter] = letter;
          });
          if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
            return false;
          }

          return true;
        } catch (err) {
          // We don't expect any of the above to throw, but better to be safe.
          return false;
        }
      }

      module.exports = shouldUseNative() ? Object.assign : function (target, source) {
        var from;
        var to = toObject(target);
        var symbols;

        for (var s = 1; s < arguments.length; s++) {
          from = Object(arguments[s]);

          for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
              to[key] = from[key];
            }
          }

          if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
              if (propIsEnumerable.call(from, symbols[i])) {
                to[symbols[i]] = from[symbols[i]];
              }
            }
          }
        }

        return to;
      };
    }, {}], 11: [function (require, module, exports) {
      var trim = require('trim'),
          forEach = require('for-each'),
          isArray = function isArray(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };

      module.exports = function (headers) {
        if (!headers) return {};

        var result = {};

        forEach(trim(headers).split('\n'), function (row) {
          var index = row.indexOf(':'),
              key = trim(row.slice(0, index)).toLowerCase(),
              value = trim(row.slice(index + 1));

          if (typeof result[key] === 'undefined') {
            result[key] = value;
          } else if (isArray(result[key])) {
            result[key].push(value);
          } else {
            result[key] = [result[key], value];
          }
        });

        return result;
      };
    }, { "for-each": 6, "trim": 18 }], 12: [function (require, module, exports) {
      'use strict';

      var strictUriEncode = require('strict-uri-encode');
      var objectAssign = require('object-assign');
      var decodeComponent = require('decode-uri-component');

      function encoderForArrayFormat(opts) {
        switch (opts.arrayFormat) {
          case 'index':
            return function (key, value, index) {
              return value === null ? [encode(key, opts), '[', index, ']'].join('') : [encode(key, opts), '[', encode(index, opts), ']=', encode(value, opts)].join('');
            };

          case 'bracket':
            return function (key, value) {
              return value === null ? encode(key, opts) : [encode(key, opts), '[]=', encode(value, opts)].join('');
            };

          default:
            return function (key, value) {
              return value === null ? encode(key, opts) : [encode(key, opts), '=', encode(value, opts)].join('');
            };
        }
      }

      function parserForArrayFormat(opts) {
        var result;

        switch (opts.arrayFormat) {
          case 'index':
            return function (key, value, accumulator) {
              result = /\[(\d*)\]$/.exec(key);

              key = key.replace(/\[\d*\]$/, '');

              if (!result) {
                accumulator[key] = value;
                return;
              }

              if (accumulator[key] === undefined) {
                accumulator[key] = {};
              }

              accumulator[key][result[1]] = value;
            };

          case 'bracket':
            return function (key, value, accumulator) {
              result = /(\[\])$/.exec(key);
              key = key.replace(/\[\]$/, '');

              if (!result) {
                accumulator[key] = value;
                return;
              } else if (accumulator[key] === undefined) {
                accumulator[key] = [value];
                return;
              }

              accumulator[key] = [].concat(accumulator[key], value);
            };

          default:
            return function (key, value, accumulator) {
              if (accumulator[key] === undefined) {
                accumulator[key] = value;
                return;
              }

              accumulator[key] = [].concat(accumulator[key], value);
            };
        }
      }

      function encode(value, opts) {
        if (opts.encode) {
          return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
        }

        return value;
      }

      function keysSorter(input) {
        if (Array.isArray(input)) {
          return input.sort();
        } else if ((typeof input === "undefined" ? "undefined" : _typeof(input)) === 'object') {
          return keysSorter(Object.keys(input)).sort(function (a, b) {
            return Number(a) - Number(b);
          }).map(function (key) {
            return input[key];
          });
        }

        return input;
      }

      function extract(str) {
        var queryStart = str.indexOf('?');
        if (queryStart === -1) {
          return '';
        }
        return str.slice(queryStart + 1);
      }

      function parse(str, opts) {
        opts = objectAssign({ arrayFormat: 'none' }, opts);

        var formatter = parserForArrayFormat(opts);

        // Create an object with no prototype
        // https://github.com/sindresorhus/query-string/issues/47
        var ret = Object.create(null);

        if (typeof str !== 'string') {
          return ret;
        }

        str = str.trim().replace(/^[?#&]/, '');

        if (!str) {
          return ret;
        }

        str.split('&').forEach(function (param) {
          var parts = param.replace(/\+/g, ' ').split('=');
          // Firefox (pre 40) decodes `%3D` to `=`
          // https://github.com/sindresorhus/query-string/pull/37
          var key = parts.shift();
          var val = parts.length > 0 ? parts.join('=') : undefined;

          // missing `=` should be `null`:
          // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
          val = val === undefined ? null : decodeComponent(val);

          formatter(decodeComponent(key), val, ret);
        });

        return Object.keys(ret).sort().reduce(function (result, key) {
          var val = ret[key];
          if (Boolean(val) && (typeof val === "undefined" ? "undefined" : _typeof(val)) === 'object' && !Array.isArray(val)) {
            // Sort object keys, not values
            result[key] = keysSorter(val);
          } else {
            result[key] = val;
          }

          return result;
        }, Object.create(null));
      }

      exports.extract = extract;
      exports.parse = parse;

      exports.stringify = function (obj, opts) {
        var defaults = {
          encode: true,
          strict: true,
          arrayFormat: 'none'
        };

        opts = objectAssign(defaults, opts);

        if (opts.sort === false) {
          opts.sort = function () {};
        }

        var formatter = encoderForArrayFormat(opts);

        return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
          var val = obj[key];

          if (val === undefined) {
            return '';
          }

          if (val === null) {
            return encode(key, opts);
          }

          if (Array.isArray(val)) {
            var result = [];

            val.slice().forEach(function (val2) {
              if (val2 === undefined) {
                return;
              }

              result.push(formatter(key, val2, result.length));
            });

            return result.join('&');
          }

          return encode(key, opts) + '=' + encode(val, opts);
        }).filter(function (x) {
          return x.length > 0;
        }).join('&') : '';
      };

      exports.parseUrl = function (str, opts) {
        return {
          url: str.split('?')[0] || '',
          query: parse(extract(str), opts)
        };
      };
    }, { "decode-uri-component": 2, "object-assign": 10, "strict-uri-encode": 13 }], 13: [function (require, module, exports) {
      'use strict';

      module.exports = function (str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
          return '%' + c.charCodeAt(0).toString(16).toUpperCase();
        });
      };
    }, {}], 14: [function (require, module, exports) {
      var unavailable = function unavailable() {
        throw "This swarm.js function isn't available on the browser.";
      };

      var fs = {
        readFile: unavailable
      };
      var files = {
        download: unavailable,
        safeDownloadArchived: unavailable,
        directoryTree: unavailable
      };
      var os = {
        platform: unavailable,
        arch: unavailable
      };
      var path = {
        join: unavailable,
        slice: unavailable
      };
      var child_process = {
        spawn: unavailable
      };
      var mimetype = {
        lookup: unavailable
      };
      var defaultArchives = {};
      var downloadUrl = null;

      var request = require("xhr-request-promise");

      var bytes = require("eth-lib/lib/bytes");

      var hash = require("./swarm-hash.js");

      var pick = require("./pick.js");

      var swarm = require("./swarm");

      module.exports = swarm({
        fs: fs,
        files: files,
        os: os,
        path: path,
        child_process: child_process,
        defaultArchives: defaultArchives,
        mimetype: mimetype,
        request: request,
        downloadUrl: downloadUrl,
        bytes: bytes,
        hash: hash,
        pick: pick
      });
    }, { "./pick.js": 15, "./swarm": 17, "./swarm-hash.js": 16, "eth-lib/lib/bytes": 4, "xhr-request-promise": 21 }], 15: [function (require, module, exports) {
      var picker = function picker(type) {
        return function () {
          return new Promise(function (resolve, reject) {
            var fileLoader = function fileLoader(e) {
              var directory = {};
              var totalFiles = e.target.files.length;
              var loadedFiles = 0;
              [].map.call(e.target.files, function (file) {
                var reader = new FileReader();

                reader.onload = function (e) {
                  var data = new Uint8Array(e.target.result);

                  if (type === "directory") {
                    var path = file.webkitRelativePath;
                    directory[path.slice(path.indexOf("/") + 1)] = {
                      type: "text/plain",
                      data: data
                    };
                    if (++loadedFiles === totalFiles) resolve(directory);
                  } else if (type === "file") {
                    var _path = file.webkitRelativePath;
                    resolve({
                      "type": mimetype.lookup(_path),
                      "data": data
                    });
                  } else {
                    resolve(data);
                  }
                };

                reader.readAsArrayBuffer(file);
              });
            };

            var fileInput;

            if (type === "directory") {
              fileInput = document.createElement("input");
              fileInput.addEventListener("change", fileLoader);
              fileInput.type = "file";
              fileInput.webkitdirectory = true;
              fileInput.mozdirectory = true;
              fileInput.msdirectory = true;
              fileInput.odirectory = true;
              fileInput.directory = true;
            } else {
              fileInput = document.createElement("input");
              fileInput.addEventListener("change", fileLoader);
              fileInput.type = "file";
            }

            ;
            var mouseEvent = document.createEvent("MouseEvents");
            mouseEvent.initEvent("click", true, false);
            fileInput.dispatchEvent(mouseEvent);
          });
        };
      };

      module.exports = {
        data: picker("data"),
        file: picker("file"),
        directory: picker("directory")
      };
    }, {}], 16: [function (require, module, exports) {
      // Thanks https://github.com/axic/swarmhash
      var keccak = require("eth-lib/lib/hash").keccak256;

      var Bytes = require("eth-lib/lib/bytes");

      var swarmHashBlock = function swarmHashBlock(length, data) {
        var lengthEncoded = Bytes.reverse(Bytes.pad(6, Bytes.fromNumber(length)));
        var bytes = Bytes.flatten([lengthEncoded, "0x0000", data]);
        return keccak(bytes).slice(2);
      }; // (Bytes | Uint8Array | String) -> String


      var swarmHash = function swarmHash(data) {
        if (typeof data === "string" && data.slice(0, 2) !== "0x") {
          data = Bytes.fromString(data);
        } else if (typeof data !== "string" && data.length !== undefined) {
          data = Bytes.fromUint8Array(data);
        }

        var length = Bytes.length(data);

        if (length <= 4096) {
          return swarmHashBlock(length, data);
        }

        var maxSize = 4096;

        while (maxSize * (4096 / 32) < length) {
          maxSize *= 4096 / 32;
        }

        var innerNodes = [];

        for (var i = 0; i < length; i += maxSize) {
          var size = maxSize < length - i ? maxSize : length - i;
          innerNodes.push(swarmHash(Bytes.slice(data, i, i + size)));
        }

        return swarmHashBlock(length, Bytes.flatten(innerNodes));
      };

      module.exports = swarmHash;
    }, { "eth-lib/lib/bytes": 4, "eth-lib/lib/hash": 5 }], 17: [function (require, module, exports) {
      // TODO: this is a temporary fix to hide those libraries from the browser. A
      // slightly better long-term solution would be to split this file into two,
      // separating the functions that are used on Node.js from the functions that
      // are used only on the browser.
      module.exports = function (_ref) {
        var fs = _ref.fs,
            files = _ref.files,
            os = _ref.os,
            path = _ref.path,
            child_process = _ref.child_process,
            mimetype = _ref.mimetype,
            defaultArchives = _ref.defaultArchives,
            request = _ref.request,
            downloadUrl = _ref.downloadUrl,
            bytes = _ref.bytes,
            hash = _ref.hash,
            pick = _ref.pick;

        // ∀ a . String -> JSON -> Map String a -o Map String a
        //   Inserts a key/val pair in an object impurely.
        var impureInsert = function impureInsert(key) {
          return function (val) {
            return function (map) {
              return map[key] = val, map;
            };
          };
        }; // String -> JSON -> Map String JSON
        //   Merges an array of keys and an array of vals into an object.


        var toMap = function toMap(keys) {
          return function (vals) {
            var map = {};

            for (var i = 0, l = keys.length; i < l; ++i) {
              map[keys[i]] = vals[i];
            }

            return map;
          };
        }; // ∀ a . Map String a -> Map String a -> Map String a
        //   Merges two maps into one.


        var merge = function merge(a) {
          return function (b) {
            var map = {};

            for (var key in a) {
              map[key] = a[key];
            }

            for (var _key in b) {
              map[_key] = b[_key];
            }

            return map;
          };
        }; // ∀ a . [a] -> [a] -> Bool


        var equals = function equals(a) {
          return function (b) {
            if (a.length !== b.length) {
              return false;
            } else {
              for (var i = 0, l = a.length; i < l; ++i) {
                if (a[i] !== b[i]) return false;
              }
            }

            return true;
          };
        }; // String -> String -> String


        var rawUrl = function rawUrl(swarmUrl) {
          return function (hash) {
            return "".concat(swarmUrl, "/bzzr:/").concat(hash);
          };
        }; // String -> String -> Promise Uint8Array
        //   Gets the raw contents of a Swarm hash address.


        var downloadData = function downloadData(swarmUrl) {
          return function (hash) {
            return request(rawUrl(swarmUrl)(hash), {
              responseType: "arraybuffer"
            }).then(function (arrayBuffer) {
              var uint8Array = new Uint8Array(arrayBuffer);
              var error404 = [52, 48, 52, 32, 112, 97, 103, 101, 32, 110, 111, 116, 32, 102, 111, 117, 110, 100, 10];
              if (equals(uint8Array)(error404)) throw "Error 404.";
              return uint8Array;
            });
          };
        }; // type Entry = {"type": String, "hash": String}
        // type File = {"type": String, "data": Uint8Array}
        // String -> String -> Promise (Map String Entry)
        //   Solves the manifest of a Swarm address recursively.
        //   Returns a map from full paths to entries.


        var downloadEntries = function downloadEntries(swarmUrl) {
          return function (hash) {
            var search = function search(hash) {
              return function (path) {
                return function (routes) {
                  // Formats an entry to the Swarm.js type.
                  var format = function format(entry) {
                    return {
                      type: entry.contentType,
                      hash: entry.hash
                    };
                  }; // To download a single entry:
                  //   if type is bzz-manifest, go deeper
                  //   if not, add it to the routing table


                  var downloadEntry = function downloadEntry(entry) {
                    if (entry.path === undefined) {
                      return Promise.resolve();
                    } else {
                      return entry.contentType === "application/bzz-manifest+json" ? search(entry.hash)(path + entry.path)(routes) : Promise.resolve(impureInsert(path + entry.path)(format(entry))(routes));
                    }
                  }; // Downloads the initial manifest and then each entry.


                  return downloadData(swarmUrl)(hash).then(function (text) {
                    return JSON.parse(toString(text)).entries;
                  }).then(function (entries) {
                    return Promise.all(entries.map(downloadEntry));
                  }).then(function () {
                    return routes;
                  });
                };
              };
            };

            return search(hash)("")({});
          };
        }; // String -> String -> Promise (Map String String)
        //   Same as `downloadEntries`, but returns only hashes (no types).


        var downloadRoutes = function downloadRoutes(swarmUrl) {
          return function (hash) {
            return downloadEntries(swarmUrl)(hash).then(function (entries) {
              return toMap(Object.keys(entries))(Object.keys(entries).map(function (route) {
                return entries[route].hash;
              }));
            });
          };
        }; // String -> String -> Promise (Map String File)
        //   Gets the entire directory tree in a Swarm address.
        //   Returns a promise mapping paths to file contents.


        var downloadDirectory = function downloadDirectory(swarmUrl) {
          return function (hash) {
            return downloadEntries(swarmUrl)(hash).then(function (entries) {
              var paths = Object.keys(entries);
              var hashs = paths.map(function (path) {
                return entries[path].hash;
              });
              var types = paths.map(function (path) {
                return entries[path].type;
              });
              var datas = hashs.map(downloadData(swarmUrl));

              var files = function files(datas) {
                return datas.map(function (data, i) {
                  return {
                    type: types[i],
                    data: data
                  };
                });
              };

              return Promise.all(datas).then(function (datas) {
                return toMap(paths)(files(datas));
              });
            });
          };
        }; // String -> String -> String -> Promise String
        //   Gets the raw contents of a Swarm hash address.
        //   Returns a promise with the downloaded file path.


        var downloadDataToDisk = function downloadDataToDisk(swarmUrl) {
          return function (hash) {
            return function (filePath) {
              return files.download(rawUrl(swarmUrl)(hash))(filePath);
            };
          };
        }; // String -> String -> String -> Promise (Map String String)
        //   Gets the entire directory tree in a Swarm address.
        //   Returns a promise mapping paths to file contents.


        var downloadDirectoryToDisk = function downloadDirectoryToDisk(swarmUrl) {
          return function (hash) {
            return function (dirPath) {
              return downloadRoutes(swarmUrl)(hash).then(function (routingTable) {
                var downloads = [];

                for (var route in routingTable) {
                  if (route.length > 0) {
                    var filePath = path.join(dirPath, route);
                    downloads.push(downloadDataToDisk(swarmUrl)(routingTable[route])(filePath));
                  }

                  ;
                }

                ;
                return Promise.all(downloads).then(function () {
                  return dirPath;
                });
              });
            };
          };
        }; // String -> Uint8Array -> Promise String
        //   Uploads raw data to Swarm.
        //   Returns a promise with the uploaded hash.


        var uploadData = function uploadData(swarmUrl) {
          return function (data) {
            return request("".concat(swarmUrl, "/bzzr:/"), {
              body: typeof data === "string" ? fromString(data) : data,
              method: "POST"
            });
          };
        }; // String -> String -> String -> File -> Promise String
        //   Uploads a file to the Swarm manifest at a given hash, under a specific
        //   route. Returns a promise containing the uploaded hash.
        //   FIXME: for some reasons Swarm-Gateways is sometimes returning
        //   error 404 (bad request), so we retry up to 3 times. Why?


        var uploadToManifest = function uploadToManifest(swarmUrl) {
          return function (hash) {
            return function (route) {
              return function (file) {
                var attempt = function attempt(n) {
                  var slashRoute = route[0] === "/" ? route : "/" + route;
                  var url = "".concat(swarmUrl, "/bzz:/").concat(hash).concat(slashRoute);
                  var opt = {
                    method: "PUT",
                    headers: {
                      "Content-Type": file.type
                    },
                    body: file.data
                  };
                  return request(url, opt).then(function (response) {
                    if (response.indexOf("error") !== -1) {
                      throw response;
                    }

                    return response;
                  }).catch(function (e) {
                    return n > 0 && attempt(n - 1);
                  });
                };

                return attempt(3);
              };
            };
          };
        }; // String -> {type: String, data: Uint8Array} -> Promise String


        var uploadFile = function uploadFile(swarmUrl) {
          return function (file) {
            return uploadDirectory(swarmUrl)({
              "": file
            });
          };
        }; // String -> String -> Promise String


        var uploadFileFromDisk = function uploadFileFromDisk(swarmUrl) {
          return function (filePath) {
            return fs.readFile(filePath).then(function (data) {
              return uploadFile(swarmUrl)({
                type: mimetype.lookup(filePath),
                data: data
              });
            });
          };
        }; // String -> Map String File -> Promise String
        //   Uploads a directory to Swarm. The directory is
        //   represented as a map of routes and files.
        //   A default path is encoded by having a "" route.


        var uploadDirectory = function uploadDirectory(swarmUrl) {
          return function (directory) {
            return uploadData(swarmUrl)("{}").then(function (hash) {
              var uploadRoute = function uploadRoute(route) {
                return function (hash) {
                  return uploadToManifest(swarmUrl)(hash)(route)(directory[route]);
                };
              };

              var uploadToHash = function uploadToHash(hash, route) {
                return hash.then(uploadRoute(route));
              };

              return Object.keys(directory).reduce(uploadToHash, Promise.resolve(hash));
            });
          };
        }; // String -> Promise String


        var uploadDataFromDisk = function uploadDataFromDisk(swarmUrl) {
          return function (filePath) {
            return fs.readFile(filePath).then(uploadData(swarmUrl));
          };
        }; // String -> Nullable String -> String -> Promise String


        var uploadDirectoryFromDisk = function uploadDirectoryFromDisk(swarmUrl) {
          return function (defaultPath) {
            return function (dirPath) {
              return files.directoryTree(dirPath).then(function (fullPaths) {
                return Promise.all(fullPaths.map(function (path) {
                  return fs.readFile(path);
                })).then(function (datas) {
                  var paths = fullPaths.map(function (path) {
                    return path.slice(dirPath.length);
                  });
                  var types = fullPaths.map(function (path) {
                    return mimetype.lookup(path) || "text/plain";
                  });
                  return toMap(paths)(datas.map(function (data, i) {
                    return {
                      type: types[i],
                      data: data
                    };
                  }));
                });
              }).then(function (directory) {
                return merge(defaultPath ? {
                  "": directory[defaultPath]
                } : {})(directory);
              }).then(uploadDirectory(swarmUrl));
            };
          };
        }; // String -> UploadInfo -> Promise String
        //   Simplified multi-type upload which calls the correct
        //   one based on the type of the argument given.


        var _upload = function upload(swarmUrl) {
          return function (arg) {
            // Upload raw data from browser
            if (arg.pick === "data") {
              return pick.data().then(uploadData(swarmUrl)); // Upload a file from browser
            } else if (arg.pick === "file") {
              return pick.file().then(uploadFile(swarmUrl)); // Upload a directory from browser
            } else if (arg.pick === "directory") {
              return pick.directory().then(uploadDirectory(swarmUrl)); // Upload directory/file from disk
            } else if (arg.path) {
              switch (arg.kind) {
                case "data":
                  return uploadDataFromDisk(swarmUrl)(arg.path);

                case "file":
                  return uploadFileFromDisk(swarmUrl)(arg.path);

                case "directory":
                  return uploadDirectoryFromDisk(swarmUrl)(arg.defaultFile)(arg.path);
              }

              ; // Upload UTF-8 string or raw data (buffer)
            } else if (arg.length || typeof arg === "string") {
              return uploadData(swarmUrl)(arg); // Upload directory with JSON
            } else if (arg instanceof Object) {
              return uploadDirectory(swarmUrl)(arg);
            }

            return Promise.reject(new Error("Bad arguments"));
          };
        }; // String -> String -> Nullable String -> Promise (String | Uint8Array | Map String Uint8Array)
        //   Simplified multi-type download which calls the correct function based on
        //   the type of the argument given, and on whether the Swwarm address has a
        //   directory or a file.


        var _download = function download(swarmUrl) {
          return function (hash) {
            return function (path) {
              return isDirectory(swarmUrl)(hash).then(function (isDir) {
                if (isDir) {
                  return path ? downloadDirectoryToDisk(swarmUrl)(hash)(path) : downloadDirectory(swarmUrl)(hash);
                } else {
                  return path ? downloadDataToDisk(swarmUrl)(hash)(path) : downloadData(swarmUrl)(hash);
                }
              });
            };
          };
        }; // String -> Promise String
        //   Downloads the Swarm binaries into a path. Returns a promise that only
        //   resolves when the exact Swarm file is there, and verified to be correct.
        //   If it was already there to begin with, skips the download.


        var downloadBinary = function downloadBinary(path, archives) {
          var system = os.platform().replace("win32", "windows") + "-" + (os.arch() === "x64" ? "amd64" : "386");
          var archive = (archives || defaultArchives)[system];
          var archiveUrl = downloadUrl + archive.archive + ".tar.gz";
          var archiveMD5 = archive.archiveMD5;
          var binaryMD5 = archive.binaryMD5;
          return files.safeDownloadArchived(archiveUrl)(archiveMD5)(binaryMD5)(path);
        }; // type SwarmSetup = {
        //   account : String,
        //   password : String,
        //   dataDir : String,
        //   binPath : String,
        //   ensApi : String,
        //   onDownloadProgress : Number ~> (),
        //   archives : [{
        //     archive: String,
        //     binaryMD5: String,
        //     archiveMD5: String
        //   }]
        // }
        // SwarmSetup ~> Promise Process
        //   Starts the Swarm process.


        var startProcess = function startProcess(swarmSetup) {
          return new Promise(function (resolve, reject) {
            var spawn = child_process.spawn;

            var hasString = function hasString(str) {
              return function (buffer) {
                return ('' + buffer).indexOf(str) !== -1;
              };
            };

            var account = swarmSetup.account,
                password = swarmSetup.password,
                dataDir = swarmSetup.dataDir,
                ensApi = swarmSetup.ensApi,
                privateKey = swarmSetup.privateKey;
            var STARTUP_TIMEOUT_SECS = 3;
            var WAITING_PASSWORD = 0;
            var STARTING = 1;
            var LISTENING = 2;
            var PASSWORD_PROMPT_HOOK = "Passphrase";
            var LISTENING_HOOK = "Swarm http proxy started";
            var state = WAITING_PASSWORD;
            var swarmProcess = spawn(swarmSetup.binPath, ['--bzzaccount', account || privateKey, '--datadir', dataDir, '--ens-api', ensApi]);

            var handleProcessOutput = function handleProcessOutput(data) {
              if (state === WAITING_PASSWORD && hasString(PASSWORD_PROMPT_HOOK)(data)) {
                setTimeout(function () {
                  state = STARTING;
                  swarmProcess.stdin.write(password + '\n');
                }, 500);
              } else if (hasString(LISTENING_HOOK)(data)) {
                state = LISTENING;
                clearTimeout(timeout);
                resolve(swarmProcess);
              }
            };

            swarmProcess.stdout.on('data', handleProcessOutput);
            swarmProcess.stderr.on('data', handleProcessOutput); //swarmProcess.on('close', () => setTimeout(restart, 2000));

            var restart = function restart() {
              return startProcess(swarmSetup).then(resolve).catch(reject);
            };

            var error = function error() {
              return reject(new Error("Couldn't start swarm process."));
            };

            var timeout = setTimeout(error, 20000);
          });
        }; // Process ~> Promise ()
        //   Stops the Swarm process.


        var stopProcess = function stopProcess(process) {
          return new Promise(function (resolve, reject) {
            process.stderr.removeAllListeners('data');
            process.stdout.removeAllListeners('data');
            process.stdin.removeAllListeners('error');
            process.removeAllListeners('error');
            process.removeAllListeners('exit');
            process.kill('SIGINT');
            var killTimeout = setTimeout(function () {
              return process.kill('SIGKILL');
            }, 8000);
            process.once('close', function () {
              clearTimeout(killTimeout);
              resolve();
            });
          });
        }; // SwarmSetup -> (SwarmAPI -> Promise ()) -> Promise ()
        //   Receives a Swarm configuration object and a callback function. It then
        //   checks if a local Swarm node is running. If no local Swarm is found, it
        //   downloads the Swarm binaries to the dataDir (if not there), checksums,
        //   starts the Swarm process and calls the callback function with an API
        //   object using the local node. That callback must return a promise which
        //   will resolve when it is done using the API, so that this function can
        //   close the Swarm process properly. Returns a promise that resolves when the
        //   user is done with the API and the Swarm process is closed.
        //   TODO: check if Swarm process is already running (improve `isAvailable`)


        var local = function local(swarmSetup) {
          return function (useAPI) {
            return _isAvailable("http://localhost:8500").then(function (isAvailable) {
              return isAvailable ? useAPI(at("http://localhost:8500")).then(function () {}) : downloadBinary(swarmSetup.binPath, swarmSetup.archives).onData(function (data) {
                return (swarmSetup.onProgress || function () {})(data.length);
              }).then(function () {
                return startProcess(swarmSetup);
              }).then(function (process) {
                return useAPI(at("http://localhost:8500")).then(function () {
                  return process;
                });
              }).then(stopProcess);
            });
          };
        }; // String ~> Promise Bool
        //   Returns true if Swarm is available on `url`.
        //   Perfoms a test upload to determine that.
        //   TODO: improve this?


        var _isAvailable = function isAvailable(swarmUrl) {
          var testFile = "test";
          var testHash = "c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7";
          return uploadData(swarmUrl)(testFile).then(function (hash) {
            return hash === testHash;
          }).catch(function () {
            return false;
          });
        }; // String -> String ~> Promise Bool
        //   Returns a Promise which is true if that Swarm address is a directory.
        //   Determines that by checking that it (i) is a JSON, (ii) has a .entries.
        //   TODO: improve this?


        var isDirectory = function isDirectory(swarmUrl) {
          return function (hash) {
            return downloadData(swarmUrl)(hash).then(function (data) {
              try {
                return !!JSON.parse(toString(data)).entries;
              } catch (e) {
                return false;
              }
            });
          };
        }; // Uncurries a function; used to allow the f(x,y,z) style on exports.


        var uncurry = function uncurry(f) {
          return function (a, b, c, d, e) {
            var p; // Hardcoded because efficiency (`arguments` is very slow).

            if (typeof a !== "undefined") p = f(a);
            if (typeof b !== "undefined") p = f(b);
            if (typeof c !== "undefined") p = f(c);
            if (typeof d !== "undefined") p = f(d);
            if (typeof e !== "undefined") p = f(e);
            return p;
          };
        }; // () -> Promise Bool
        //   Not sure how to mock Swarm to test it properly. Ideas?


        var test = function test() {
          return Promise.resolve(true);
        }; // Uint8Array -> String


        var toString = function toString(uint8Array) {
          return bytes.toString(bytes.fromUint8Array(uint8Array));
        }; // String -> Uint8Array


        var fromString = function fromString(string) {
          return bytes.toUint8Array(bytes.fromString(string));
        }; // String -> SwarmAPI
        //   Fixes the `swarmUrl`, returning an API where you don't have to pass it.


        var at = function at(swarmUrl) {
          return {
            download: function download(hash, path) {
              return _download(swarmUrl)(hash)(path);
            },
            downloadData: uncurry(downloadData(swarmUrl)),
            downloadDataToDisk: uncurry(downloadDataToDisk(swarmUrl)),
            downloadDirectory: uncurry(downloadDirectory(swarmUrl)),
            downloadDirectoryToDisk: uncurry(downloadDirectoryToDisk(swarmUrl)),
            downloadEntries: uncurry(downloadEntries(swarmUrl)),
            downloadRoutes: uncurry(downloadRoutes(swarmUrl)),
            isAvailable: function isAvailable() {
              return _isAvailable(swarmUrl);
            },
            upload: function upload(arg) {
              return _upload(swarmUrl)(arg);
            },
            uploadData: uncurry(uploadData(swarmUrl)),
            uploadFile: uncurry(uploadFile(swarmUrl)),
            uploadFileFromDisk: uncurry(uploadFile(swarmUrl)),
            uploadDataFromDisk: uncurry(uploadDataFromDisk(swarmUrl)),
            uploadDirectory: uncurry(uploadDirectory(swarmUrl)),
            uploadDirectoryFromDisk: uncurry(uploadDirectoryFromDisk(swarmUrl)),
            uploadToManifest: uncurry(uploadToManifest(swarmUrl)),
            pick: pick,
            hash: hash,
            fromString: fromString,
            toString: toString
          };
        };

        return {
          at: at,
          local: local,
          download: _download,
          downloadBinary: downloadBinary,
          downloadData: downloadData,
          downloadDataToDisk: downloadDataToDisk,
          downloadDirectory: downloadDirectory,
          downloadDirectoryToDisk: downloadDirectoryToDisk,
          downloadEntries: downloadEntries,
          downloadRoutes: downloadRoutes,
          isAvailable: _isAvailable,
          startProcess: startProcess,
          stopProcess: stopProcess,
          upload: _upload,
          uploadData: uploadData,
          uploadDataFromDisk: uploadDataFromDisk,
          uploadFile: uploadFile,
          uploadFileFromDisk: uploadFileFromDisk,
          uploadDirectory: uploadDirectory,
          uploadDirectoryFromDisk: uploadDirectoryFromDisk,
          uploadToManifest: uploadToManifest,
          pick: pick,
          hash: hash,
          fromString: fromString,
          toString: toString
        };
      };
    }, {}], 18: [function (require, module, exports) {

      exports = module.exports = trim;

      function trim(str) {
        return str.replace(/^\s*|\s*$/g, '');
      }

      exports.left = function (str) {
        return str.replace(/^\s*/, '');
      };

      exports.right = function (str) {
        return str.replace(/\s*$/, '');
      };
    }, {}], 19: [function (require, module, exports) {
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
    }, {}], 20: [function (require, module, exports) {
      module.exports = urlSetQuery;
      function urlSetQuery(url, query) {
        if (query) {
          // remove optional leading symbols
          query = query.trim().replace(/^(\?|#|&)/, '');

          // don't append empty query
          query = query ? '?' + query : query;

          var parts = url.split(/[\?\#]/);
          var start = parts[0];
          if (query && /\:\/\/[^\/]*$/.test(start)) {
            // e.g. http://foo.com -> http://foo.com/
            start = start + '/';
          }
          var match = url.match(/(\#.*)$/);
          url = start + query;
          if (match) {
            // add hash back in
            url = url + match[0];
          }
        }
        return url;
      }
    }, {}], 21: [function (require, module, exports) {
      var request = require('xhr-request');

      module.exports = function (url, options) {
        return new Promise(function (resolve, reject) {
          request(url, options, function (err, data) {
            if (err) reject(err);else resolve(data);
          });
        });
      };
    }, { "xhr-request": 22 }], 22: [function (require, module, exports) {
      var queryString = require('query-string');
      var setQuery = require('url-set-query');
      var assign = require('object-assign');
      var ensureHeader = require('./lib/ensure-header.js');

      // this is replaced in the browser
      var request = require('./lib/request.js');

      var mimeTypeJson = 'application/json';
      var noop = function noop() {};

      module.exports = xhrRequest;
      function xhrRequest(url, opt, cb) {
        if (!url || typeof url !== 'string') {
          throw new TypeError('must specify a URL');
        }
        if (typeof opt === 'function') {
          cb = opt;
          opt = {};
        }
        if (cb && typeof cb !== 'function') {
          throw new TypeError('expected cb to be undefined or a function');
        }

        cb = cb || noop;
        opt = opt || {};

        var defaultResponse = opt.json ? 'json' : 'text';
        opt = assign({ responseType: defaultResponse }, opt);

        var headers = opt.headers || {};
        var method = (opt.method || 'GET').toUpperCase();
        var query = opt.query;
        if (query) {
          if (typeof query !== 'string') {
            query = queryString.stringify(query);
          }
          url = setQuery(url, query);
        }

        // allow json response
        if (opt.responseType === 'json') {
          ensureHeader(headers, 'Accept', mimeTypeJson);
        }

        // if body content is json
        if (opt.json && method !== 'GET' && method !== 'HEAD') {
          ensureHeader(headers, 'Content-Type', mimeTypeJson);
          opt.body = JSON.stringify(opt.body);
        }

        opt.method = method;
        opt.url = url;
        opt.headers = headers;
        delete opt.query;
        delete opt.json;

        return request(opt, cb);
      }
    }, { "./lib/ensure-header.js": 23, "./lib/request.js": 25, "object-assign": 10, "query-string": 12, "url-set-query": 20 }], 23: [function (require, module, exports) {
      module.exports = ensureHeader;
      function ensureHeader(headers, key, value) {
        var lower = key.toLowerCase();
        if (!headers[key] && !headers[lower]) {
          headers[key] = value;
        }
      }
    }, {}], 24: [function (require, module, exports) {
      module.exports = getResponse;
      function getResponse(opt, resp) {
        if (!resp) return null;
        return {
          statusCode: resp.statusCode,
          headers: resp.headers,
          method: opt.method,
          url: opt.url,
          // the XHR object in browser, http response in Node
          rawRequest: resp.rawRequest ? resp.rawRequest : resp
        };
      }
    }, {}], 25: [function (require, module, exports) {
      var xhr = require('xhr');
      var normalize = require('./normalize-response');
      var noop = function noop() {};

      module.exports = xhrRequest;
      function xhrRequest(opt, cb) {
        delete opt.uri;

        // for better JSON.parse error handling than xhr module
        var useJson = false;
        if (opt.responseType === 'json') {
          opt.responseType = 'text';
          useJson = true;
        }

        var req = xhr(opt, function xhrRequestResult(err, resp, body) {
          if (useJson && !err) {
            try {
              var text = resp.rawRequest.responseText;
              body = JSON.parse(text);
            } catch (e) {
              err = e;
            }
          }

          resp = normalize(opt, resp);
          if (err) cb(err, null, resp);else cb(err, body, resp);
          cb = noop;
        });

        // Patch abort() so that it also calls the callback, but with an error
        var onabort = req.onabort;
        req.onabort = function () {
          var ret = onabort.apply(req, Array.prototype.slice.call(arguments));
          cb(new Error('XHR Aborted'));
          cb = noop;
          return ret;
        };

        return req;
      }
    }, { "./normalize-response": 24, "xhr": 26 }], 26: [function (require, module, exports) {
      "use strict";

      var window = require("global/window");
      var isFunction = require("is-function");
      var parseHeaders = require("parse-headers");
      var xtend = require("xtend");

      module.exports = createXHR;
      // Allow use of default import syntax in TypeScript
      module.exports.default = createXHR;
      createXHR.XMLHttpRequest = window.XMLHttpRequest || noop;
      createXHR.XDomainRequest = "withCredentials" in new createXHR.XMLHttpRequest() ? createXHR.XMLHttpRequest : window.XDomainRequest;

      forEachArray(["get", "put", "post", "patch", "head", "delete"], function (method) {
        createXHR[method === "delete" ? "del" : method] = function (uri, options, callback) {
          options = initParams(uri, options, callback);
          options.method = method.toUpperCase();
          return _createXHR(options);
        };
      });

      function forEachArray(array, iterator) {
        for (var i = 0; i < array.length; i++) {
          iterator(array[i]);
        }
      }

      function isEmpty(obj) {
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) return false;
        }
        return true;
      }

      function initParams(uri, options, callback) {
        var params = uri;

        if (isFunction(options)) {
          callback = options;
          if (typeof uri === "string") {
            params = { uri: uri };
          }
        } else {
          params = xtend(options, { uri: uri });
        }

        params.callback = callback;
        return params;
      }

      function createXHR(uri, options, callback) {
        options = initParams(uri, options, callback);
        return _createXHR(options);
      }

      function _createXHR(options) {
        if (typeof options.callback === "undefined") {
          throw new Error("callback argument missing");
        }

        var called = false;
        var callback = function cbOnce(err, response, body) {
          if (!called) {
            called = true;
            options.callback(err, response, body);
          }
        };

        function readystatechange() {
          if (xhr.readyState === 4) {
            setTimeout(loadFunc, 0);
          }
        }

        function getBody() {
          // Chrome with requestType=blob throws errors arround when even testing access to responseText
          var body = undefined;

          if (xhr.response) {
            body = xhr.response;
          } else {
            body = xhr.responseText || getXml(xhr);
          }

          if (isJson) {
            try {
              body = JSON.parse(body);
            } catch (e) {}
          }

          return body;
        }

        function errorFunc(evt) {
          clearTimeout(timeoutTimer);
          if (!(evt instanceof Error)) {
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error"));
          }
          evt.statusCode = 0;
          return callback(evt, failureResponse);
        }

        // will load the data & process the response in a special response object
        function loadFunc() {
          if (aborted) return;
          var status;
          clearTimeout(timeoutTimer);
          if (options.useXDR && xhr.status === undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200;
          } else {
            status = xhr.status === 1223 ? 204 : xhr.status;
          }
          var response = failureResponse;
          var err = null;

          if (status !== 0) {
            response = {
              body: getBody(),
              statusCode: status,
              method: method,
              headers: {},
              url: uri,
              rawRequest: xhr
            };
            if (xhr.getAllResponseHeaders) {
              //remember xhr can in fact be XDR for CORS in IE
              response.headers = parseHeaders(xhr.getAllResponseHeaders());
            }
          } else {
            err = new Error("Internal XMLHttpRequest Error");
          }
          return callback(err, response, response.body);
        }

        var xhr = options.xhr || null;

        if (!xhr) {
          if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest();
          } else {
            xhr = new createXHR.XMLHttpRequest();
          }
        }

        var key;
        var aborted;
        var uri = xhr.url = options.uri || options.url;
        var method = xhr.method = options.method || "GET";
        var body = options.body || options.data;
        var headers = xhr.headers = options.headers || {};
        var sync = !!options.sync;
        var isJson = false;
        var timeoutTimer;
        var failureResponse = {
          body: undefined,
          headers: {},
          statusCode: 0,
          method: method,
          url: uri,
          rawRequest: xhr
        };

        if ("json" in options && options.json !== false) {
          isJson = true;
          headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json"); //Don't override existing accept header declared by user
          if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json"); //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json);
          }
        }

        xhr.onreadystatechange = readystatechange;
        xhr.onload = loadFunc;
        xhr.onerror = errorFunc;
        // IE9 must have onprogress be set to a unique function.
        xhr.onprogress = function () {
          // IE must die
        };
        xhr.onabort = function () {
          aborted = true;
        };
        xhr.ontimeout = errorFunc;
        xhr.open(method, uri, !sync, options.username, options.password);
        //has to be after open
        if (!sync) {
          xhr.withCredentials = !!options.withCredentials;
        }
        // Cannot set timeout with sync request
        // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
        // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
        if (!sync && options.timeout > 0) {
          timeoutTimer = setTimeout(function () {
            if (aborted) return;
            aborted = true; //IE9 may still call readystatechange
            xhr.abort("timeout");
            var e = new Error("XMLHttpRequest timeout");
            e.code = "ETIMEDOUT";
            errorFunc(e);
          }, options.timeout);
        }

        if (xhr.setRequestHeader) {
          for (key in headers) {
            if (headers.hasOwnProperty(key)) {
              xhr.setRequestHeader(key, headers[key]);
            }
          }
        } else if (options.headers && !isEmpty(options.headers)) {
          throw new Error("Headers cannot be set on an XDomainRequest object");
        }

        if ("responseType" in options) {
          xhr.responseType = options.responseType;
        }

        if ("beforeSend" in options && typeof options.beforeSend === "function") {
          options.beforeSend(xhr);
        }

        // Microsoft Edge browser sends "undefined" when send is called with undefined value.
        // XMLHttpRequest spec says to pass null as body to indicate no body
        // See https://github.com/naugtur/xhr/issues/100.
        xhr.send(body || null);

        return xhr;
      }

      function getXml(xhr) {
        // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
        // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
        try {
          if (xhr.responseType === "document") {
            return xhr.responseXML;
          }
          var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";
          if (xhr.responseType === "" && !firefoxBugTakenEffect) {
            return xhr.responseXML;
          }
        } catch (e) {}

        return null;
      }

      function noop() {}
    }, { "global/window": 7, "is-function": 9, "parse-headers": 11, "xtend": 27 }], 27: [function (require, module, exports) {
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
    }, {}], "BN": [function (require, module, exports) {
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
    }, { "buffer": 1 }], "Web3Bzz": [function (require, module, exports) {
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
      var swarm = require("swarm-js");

      var Bzz = function Bzz(provider) {

        this.givenProvider = Bzz.givenProvider;

        if (provider && provider._requestManager) {
          provider = provider.currentProvider;
        }

        // only allow file picker when in browser
        if (typeof document !== 'undefined') {
          this.pick = swarm.pick;
        }

        this.setProvider(provider);
      };

      // set default ethereum provider
      /* jshint ignore:start */
      Bzz.givenProvider = null;
      if (typeof ethereumProvider !== 'undefined' && ethereumProvider.bzz) {
        Bzz.givenProvider = ethereumProvider.bzz;
      }
      /* jshint ignore:end */

      Bzz.prototype.setProvider = function (provider) {
        // is ethereum provider
        if (_.isObject(provider) && _.isString(provider.bzz)) {
          provider = provider.bzz;
          // is no string, set default
        }
        // else if(!_.isString(provider)) {
        //      provider = 'http://swarm-gateways.net'; // default to gateway
        // }


        if (_.isString(provider)) {
          this.currentProvider = provider;
        } else {
          this.currentProvider = null;

          var noProviderError = new Error('No provider set, please set one using bzz.setProvider().');

          this.download = this.upload = this.isAvailable = function () {
            throw noProviderError;
          };

          return false;
        }

        // add functions
        this.download = swarm.at(provider).download;
        this.upload = swarm.at(provider).upload;
        this.isAvailable = swarm.at(provider).isAvailable;

        return true;
      };

      module.exports = Bzz;
    }, { "swarm-js": 14, "underscore": 19 }] }, {}, ["Web3Bzz"])("Web3Bzz");
});
//# sourceMappingURL=web3-bzz.js.map