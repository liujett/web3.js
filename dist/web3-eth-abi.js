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
    }g.Web3EthAbi = f();
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
    }, {}], 3: [function (require, module, exports) {
      (function (process, global) {
        /**
         * [js-sha3]{@link https://github.com/emn178/js-sha3}
         *
         * @version 0.5.7
         * @author Chen, Yi-Cyuan [emn178@gmail.com]
         * @copyright Chen, Yi-Cyuan 2015-2016
         * @license MIT
         */
        /*jslint bitwise: true */
        (function () {
          'use strict';

          var root = (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' ? window : {};
          var NODE_JS = !root.JS_SHA3_NO_NODE_JS && (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process.versions && process.versions.node;
          if (NODE_JS) {
            root = global;
          }
          var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports;
          var HEX_CHARS = '0123456789abcdef'.split('');
          var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
          var KECCAK_PADDING = [1, 256, 65536, 16777216];
          var PADDING = [6, 1536, 393216, 100663296];
          var SHIFT = [0, 8, 16, 24];
          var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
          var BITS = [224, 256, 384, 512];
          var SHAKE_BITS = [128, 256];
          var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array'];

          var createOutputMethod = function createOutputMethod(bits, padding, outputType) {
            return function (message) {
              return new Keccak(bits, padding, bits).update(message)[outputType]();
            };
          };

          var createShakeOutputMethod = function createShakeOutputMethod(bits, padding, outputType) {
            return function (message, outputBits) {
              return new Keccak(bits, padding, outputBits).update(message)[outputType]();
            };
          };

          var createMethod = function createMethod(bits, padding) {
            var method = createOutputMethod(bits, padding, 'hex');
            method.create = function () {
              return new Keccak(bits, padding, bits);
            };
            method.update = function (message) {
              return method.create().update(message);
            };
            for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
              var type = OUTPUT_TYPES[i];
              method[type] = createOutputMethod(bits, padding, type);
            }
            return method;
          };

          var createShakeMethod = function createShakeMethod(bits, padding) {
            var method = createShakeOutputMethod(bits, padding, 'hex');
            method.create = function (outputBits) {
              return new Keccak(bits, padding, outputBits);
            };
            method.update = function (message, outputBits) {
              return method.create(outputBits).update(message);
            };
            for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
              var type = OUTPUT_TYPES[i];
              method[type] = createShakeOutputMethod(bits, padding, type);
            }
            return method;
          };

          var algorithms = [{ name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod }, { name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod }, { name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod }];

          var methods = {},
              methodNames = [];

          for (var i = 0; i < algorithms.length; ++i) {
            var algorithm = algorithms[i];
            var bits = algorithm.bits;
            for (var j = 0; j < bits.length; ++j) {
              var methodName = algorithm.name + '_' + bits[j];
              methodNames.push(methodName);
              methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
            }
          }

          function Keccak(bits, padding, outputBits) {
            this.blocks = [];
            this.s = [];
            this.padding = padding;
            this.outputBits = outputBits;
            this.reset = true;
            this.block = 0;
            this.start = 0;
            this.blockCount = 1600 - (bits << 1) >> 5;
            this.byteCount = this.blockCount << 2;
            this.outputBlocks = outputBits >> 5;
            this.extraBytes = (outputBits & 31) >> 3;

            for (var i = 0; i < 50; ++i) {
              this.s[i] = 0;
            }
          }

          Keccak.prototype.update = function (message) {
            var notString = typeof message !== 'string';
            if (notString && message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            }
            var length = message.length,
                blocks = this.blocks,
                byteCount = this.byteCount,
                blockCount = this.blockCount,
                index = 0,
                s = this.s,
                i,
                code;

            while (index < length) {
              if (this.reset) {
                this.reset = false;
                blocks[0] = this.block;
                for (i = 1; i < blockCount + 1; ++i) {
                  blocks[i] = 0;
                }
              }
              if (notString) {
                for (i = this.start; index < length && i < byteCount; ++index) {
                  blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
                }
              } else {
                for (i = this.start; index < length && i < byteCount; ++index) {
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
              this.lastByteIndex = i;
              if (i >= byteCount) {
                this.start = i - byteCount;
                this.block = blocks[blockCount];
                for (i = 0; i < blockCount; ++i) {
                  s[i] ^= blocks[i];
                }
                f(s);
                this.reset = true;
              } else {
                this.start = i;
              }
            }
            return this;
          };

          Keccak.prototype.finalize = function () {
            var blocks = this.blocks,
                i = this.lastByteIndex,
                blockCount = this.blockCount,
                s = this.s;
            blocks[i >> 2] |= this.padding[i & 3];
            if (this.lastByteIndex === this.byteCount) {
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
          };

          Keccak.prototype.toString = Keccak.prototype.hex = function () {
            this.finalize();

            var blockCount = this.blockCount,
                s = this.s,
                outputBlocks = this.outputBlocks,
                extraBytes = this.extraBytes,
                i = 0,
                j = 0;
            var hex = '',
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
            if (extraBytes) {
              block = s[i];
              if (extraBytes > 0) {
                hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F];
              }
              if (extraBytes > 1) {
                hex += HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F];
              }
              if (extraBytes > 2) {
                hex += HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F];
              }
            }
            return hex;
          };

          Keccak.prototype.arrayBuffer = function () {
            this.finalize();

            var blockCount = this.blockCount,
                s = this.s,
                outputBlocks = this.outputBlocks,
                extraBytes = this.extraBytes,
                i = 0,
                j = 0;
            var bytes = this.outputBits >> 3;
            var buffer;
            if (extraBytes) {
              buffer = new ArrayBuffer(outputBlocks + 1 << 2);
            } else {
              buffer = new ArrayBuffer(bytes);
            }
            var array = new Uint32Array(buffer);
            while (j < outputBlocks) {
              for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                array[j] = s[i];
              }
              if (j % blockCount === 0) {
                f(s);
              }
            }
            if (extraBytes) {
              array[i] = s[i];
              buffer = buffer.slice(0, bytes);
            }
            return buffer;
          };

          Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

          Keccak.prototype.digest = Keccak.prototype.array = function () {
            this.finalize();

            var blockCount = this.blockCount,
                s = this.s,
                outputBlocks = this.outputBlocks,
                extraBytes = this.extraBytes,
                i = 0,
                j = 0;
            var array = [],
                offset,
                block;
            while (j < outputBlocks) {
              for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                offset = j << 2;
                block = s[i];
                array[offset] = block & 0xFF;
                array[offset + 1] = block >> 8 & 0xFF;
                array[offset + 2] = block >> 16 & 0xFF;
                array[offset + 3] = block >> 24 & 0xFF;
              }
              if (j % blockCount === 0) {
                f(s);
              }
            }
            if (extraBytes) {
              offset = j << 2;
              block = s[i];
              if (extraBytes > 0) {
                array[offset] = block & 0xFF;
              }
              if (extraBytes > 1) {
                array[offset + 1] = block >> 8 & 0xFF;
              }
              if (extraBytes > 2) {
                array[offset + 2] = block >> 16 & 0xFF;
              }
            }
            return array;
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

          if (COMMON_JS) {
            module.exports = methods;
          } else {
            for (var i = 0; i < methodNames.length; ++i) {
              root[methodNames[i]] = methods[methodNames[i]];
            }
          }
        })();
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "_process": 20 }], 4: [function (require, module, exports) {
      'use strict';

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
      var __importStar = this && this.__importStar || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) {
          if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }result["default"] = mod;
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      // See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
      var address_1 = require("./address");
      var bignumber_1 = require("./bignumber");
      var bytes_1 = require("./bytes");
      var utf8_1 = require("./utf8");
      var properties_1 = require("./properties");
      var errors = __importStar(require("./errors"));
      var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
      var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
      var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
      exports.defaultCoerceFunc = function (type, value) {
        var match = type.match(paramTypeNumber);
        if (match && parseInt(match[2]) <= 48) {
          return value.toNumber();
        }
        return value;
      };
      ///////////////////////////////////
      // Parsing for Solidity Signatures
      var regexParen = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
      var regexIdentifier = new RegExp("^[A-Za-z_][A-Za-z0-9_]*$");
      function verifyType(type) {
        // These need to be transformed to their full description
        if (type.match(/^uint($|[^1-9])/)) {
          type = 'uint256' + type.substring(4);
        } else if (type.match(/^int($|[^1-9])/)) {
          type = 'int256' + type.substring(3);
        }
        return type;
      }
      function parseParam(param, allowIndexed) {
        function throwError(i) {
          throw new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"');
        }
        var parent = { type: '', name: '', state: { allowType: true } };
        var node = parent;
        for (var i = 0; i < param.length; i++) {
          var c = param[i];
          switch (c) {
            case '(':
              if (!node.state.allowParams) {
                throwError(i);
              }
              node.state.allowType = false;
              node.type = verifyType(node.type);
              node.components = [{ type: '', name: '', parent: node, state: { allowType: true } }];
              node = node.components[0];
              break;
            case ')':
              delete node.state;
              if (allowIndexed && node.name === 'indexed') {
                node.indexed = true;
                node.name = '';
              }
              node.type = verifyType(node.type);
              var child = node;
              node = node.parent;
              if (!node) {
                throwError(i);
              }
              delete child.parent;
              node.state.allowParams = false;
              node.state.allowName = true;
              node.state.allowArray = true;
              break;
            case ',':
              delete node.state;
              if (allowIndexed && node.name === 'indexed') {
                node.indexed = true;
                node.name = '';
              }
              node.type = verifyType(node.type);
              var sibling = { type: '', name: '', parent: node.parent, state: { allowType: true } };
              node.parent.components.push(sibling);
              delete node.parent;
              node = sibling;
              break;
            // Hit a space...
            case ' ':
              // If reading type, the type is done and may read a param or name
              if (node.state.allowType) {
                if (node.type !== '') {
                  node.type = verifyType(node.type);
                  delete node.state.allowType;
                  node.state.allowName = true;
                  node.state.allowParams = true;
                }
              }
              // If reading name, the name is done
              if (node.state.allowName) {
                if (node.name !== '') {
                  if (allowIndexed && node.name === 'indexed') {
                    node.indexed = true;
                    node.name = '';
                  } else {
                    node.state.allowName = false;
                  }
                }
              }
              break;
            case '[':
              if (!node.state.allowArray) {
                throwError(i);
              }
              node.type += c;
              node.state.allowArray = false;
              node.state.allowName = false;
              node.state.readArray = true;
              break;
            case ']':
              if (!node.state.readArray) {
                throwError(i);
              }
              node.type += c;
              node.state.readArray = false;
              node.state.allowArray = true;
              node.state.allowName = true;
              break;
            default:
              if (node.state.allowType) {
                node.type += c;
                node.state.allowParams = true;
                node.state.allowArray = true;
              } else if (node.state.allowName) {
                node.name += c;
                delete node.state.allowArray;
              } else if (node.state.readArray) {
                node.type += c;
              } else {
                throwError(i);
              }
          }
        }
        if (node.parent) {
          throw new Error("unexpected eof");
        }
        delete parent.state;
        if (allowIndexed && node.name === 'indexed') {
          node.indexed = true;
          node.name = '';
        }
        parent.type = verifyType(parent.type);
        return parent;
      }
      // @TODO: Better return type
      function parseSignatureEvent(fragment) {
        var abi = {
          anonymous: false,
          inputs: [],
          name: '',
          type: 'event'
        };
        var match = fragment.match(regexParen);
        if (!match) {
          throw new Error('invalid event: ' + fragment);
        }
        abi.name = match[1].trim();
        splitNesting(match[2]).forEach(function (param) {
          param = parseParam(param, true);
          param.indexed = !!param.indexed;
          abi.inputs.push(param);
        });
        match[3].split(' ').forEach(function (modifier) {
          switch (modifier) {
            case 'anonymous':
              abi.anonymous = true;
              break;
            case '':
              break;
            default:
              console.log('unknown modifier: ' + modifier);
          }
        });
        if (abi.name && !abi.name.match(regexIdentifier)) {
          throw new Error('invalid identifier: "' + abi.name + '"');
        }
        return abi;
      }
      function parseSignatureFunction(fragment) {
        var abi = {
          constant: false,
          inputs: [],
          name: '',
          outputs: [],
          payable: false,
          stateMutability: null,
          type: 'function'
        };
        var comps = fragment.split(' returns ');
        var left = comps[0].match(regexParen);
        if (!left) {
          throw new Error('invalid signature');
        }
        abi.name = left[1].trim();
        if (!abi.name.match(regexIdentifier)) {
          throw new Error('invalid identifier: "' + left[1] + '"');
        }
        splitNesting(left[2]).forEach(function (param) {
          abi.inputs.push(parseParam(param));
        });
        left[3].split(' ').forEach(function (modifier) {
          switch (modifier) {
            case 'constant':
              abi.constant = true;
              break;
            case 'payable':
              abi.payable = true;
              break;
            case 'pure':
              abi.constant = true;
              abi.stateMutability = 'pure';
              break;
            case 'view':
              abi.constant = true;
              abi.stateMutability = 'view';
              break;
            case '':
              break;
            default:
              console.log('unknown modifier: ' + modifier);
          }
        });
        // We have outputs
        if (comps.length > 1) {
          var right = comps[1].match(regexParen);
          if (right[1].trim() != '' || right[3].trim() != '') {
            throw new Error('unexpected tokens');
          }
          splitNesting(right[2]).forEach(function (param) {
            abi.outputs.push(parseParam(param));
          });
        }
        return abi;
      }
      function parseParamType(type) {
        return parseParam(type, true);
      }
      exports.parseParamType = parseParamType;
      // @TODO: Allow a second boolean to expose names
      function formatParamType(paramType) {
        return getParamCoder(exports.defaultCoerceFunc, paramType).type;
      }
      exports.formatParamType = formatParamType;
      // @TODO: Allow a second boolean to expose names and modifiers
      function formatSignature(fragment) {
        return fragment.name + '(' + fragment.inputs.map(function (i) {
          return formatParamType(i);
        }).join(',') + ')';
      }
      exports.formatSignature = formatSignature;
      function parseSignature(fragment) {
        if (typeof fragment === 'string') {
          // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
          fragment = fragment.replace(/\(/g, ' (').replace(/\)/g, ') ').replace(/\s+/g, ' ');
          fragment = fragment.trim();
          if (fragment.substring(0, 6) === 'event ') {
            return parseSignatureEvent(fragment.substring(6).trim());
          } else {
            if (fragment.substring(0, 9) === 'function ') {
              fragment = fragment.substring(9);
            }
            return parseSignatureFunction(fragment.trim());
          }
        }
        throw new Error('unknown signature');
      }
      exports.parseSignature = parseSignature;
      var Coder = /** @class */function () {
        function Coder(coerceFunc, name, type, localName, dynamic) {
          this.coerceFunc = coerceFunc;
          this.name = name;
          this.type = type;
          this.localName = localName;
          this.dynamic = dynamic;
        }
        return Coder;
      }();
      // Clones the functionality of an existing Coder, but without a localName
      var CoderAnonymous = /** @class */function (_super) {
        __extends(CoderAnonymous, _super);
        function CoderAnonymous(coder) {
          var _this = _super.call(this, coder.coerceFunc, coder.name, coder.type, undefined, coder.dynamic) || this;
          properties_1.defineReadOnly(_this, 'coder', coder);
          return _this;
        }
        CoderAnonymous.prototype.encode = function (value) {
          return this.coder.encode(value);
        };
        CoderAnonymous.prototype.decode = function (data, offset) {
          return this.coder.decode(data, offset);
        };
        return CoderAnonymous;
      }(Coder);
      var CoderNull = /** @class */function (_super) {
        __extends(CoderNull, _super);
        function CoderNull(coerceFunc, localName) {
          return _super.call(this, coerceFunc, 'null', '', localName, false) || this;
        }
        CoderNull.prototype.encode = function (value) {
          return bytes_1.arrayify([]);
        };
        CoderNull.prototype.decode = function (data, offset) {
          if (offset > data.length) {
            throw new Error('invalid null');
          }
          return {
            consumed: 0,
            value: this.coerceFunc('null', undefined)
          };
        };
        return CoderNull;
      }(Coder);
      var CoderNumber = /** @class */function (_super) {
        __extends(CoderNumber, _super);
        function CoderNumber(coerceFunc, size, signed, localName) {
          var _this = this;
          var name = (signed ? 'int' : 'uint') + size * 8;
          _this = _super.call(this, coerceFunc, name, name, localName, false) || this;
          _this.size = size;
          _this.signed = signed;
          return _this;
        }
        CoderNumber.prototype.encode = function (value) {
          try {
            var v = bignumber_1.bigNumberify(value);
            v = v.toTwos(this.size * 8).maskn(this.size * 8);
            //value = value.toTwos(size * 8).maskn(size * 8);
            if (this.signed) {
              v = v.fromTwos(this.size * 8).toTwos(256);
            }
            return bytes_1.padZeros(bytes_1.arrayify(v), 32);
          } catch (error) {
            errors.throwError('invalid number value', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: this.name,
              value: value
            });
          }
          return null;
        };
        CoderNumber.prototype.decode = function (data, offset) {
          if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + this.name + ' type', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: this.name,
              value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
          }
          var junkLength = 32 - this.size;
          var value = bignumber_1.bigNumberify(data.slice(offset + junkLength, offset + 32));
          if (this.signed) {
            value = value.fromTwos(this.size * 8);
          } else {
            value = value.maskn(this.size * 8);
          }
          return {
            consumed: 32,
            value: this.coerceFunc(this.name, value)
          };
        };
        return CoderNumber;
      }(Coder);
      var uint256Coder = new CoderNumber(function (type, value) {
        return value;
      }, 32, false, 'none');
      var CoderBoolean = /** @class */function (_super) {
        __extends(CoderBoolean, _super);
        function CoderBoolean(coerceFunc, localName) {
          return _super.call(this, coerceFunc, 'bool', 'bool', localName, false) || this;
        }
        CoderBoolean.prototype.encode = function (value) {
          return uint256Coder.encode(!!value ? 1 : 0);
        };
        CoderBoolean.prototype.decode = function (data, offset) {
          try {
            var result = uint256Coder.decode(data, offset);
          } catch (error) {
            if (error.reason === 'insufficient data for uint256 type') {
              errors.throwError('insufficient data for boolean type', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'boolean',
                value: error.value
              });
            }
            throw error;
          }
          return {
            consumed: result.consumed,
            value: this.coerceFunc('bool', !result.value.isZero())
          };
        };
        return CoderBoolean;
      }(Coder);
      var CoderFixedBytes = /** @class */function (_super) {
        __extends(CoderFixedBytes, _super);
        function CoderFixedBytes(coerceFunc, length, localName) {
          var _this = this;
          var name = 'bytes' + length;
          _this = _super.call(this, coerceFunc, name, name, localName, false) || this;
          _this.length = length;
          return _this;
        }
        CoderFixedBytes.prototype.encode = function (value) {
          var result = new Uint8Array(32);
          try {
            var data = bytes_1.arrayify(value);
            if (data.length > 32) {
              throw new Error();
            }
            result.set(data);
          } catch (error) {
            errors.throwError('invalid ' + this.name + ' value', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: this.name,
              value: error.value || value
            });
          }
          return result;
        };
        CoderFixedBytes.prototype.decode = function (data, offset) {
          if (data.length < offset + 32) {
            errors.throwError('insufficient data for ' + name + ' type', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: this.name,
              value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
          }
          return {
            consumed: 32,
            value: this.coerceFunc(this.name, bytes_1.hexlify(data.slice(offset, offset + this.length)))
          };
        };
        return CoderFixedBytes;
      }(Coder);
      var CoderAddress = /** @class */function (_super) {
        __extends(CoderAddress, _super);
        function CoderAddress(coerceFunc, localName) {
          return _super.call(this, coerceFunc, 'address', 'address', localName, false) || this;
        }
        CoderAddress.prototype.encode = function (value) {
          var result = new Uint8Array(32);
          try {
            result.set(bytes_1.arrayify(address_1.getAddress(value)), 12);
          } catch (error) {
            errors.throwError('invalid address', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: 'address',
              value: value
            });
          }
          return result;
        };
        CoderAddress.prototype.decode = function (data, offset) {
          if (data.length < offset + 32) {
            errors.throwError('insufficuent data for address type', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: 'address',
              value: bytes_1.hexlify(data.slice(offset, offset + 32))
            });
          }
          return {
            consumed: 32,
            value: this.coerceFunc('address', address_1.getAddress(bytes_1.hexlify(data.slice(offset + 12, offset + 32))))
          };
        };
        return CoderAddress;
      }(Coder);
      function _encodeDynamicBytes(value) {
        var dataLength = 32 * Math.ceil(value.length / 32);
        var padding = new Uint8Array(dataLength - value.length);
        return bytes_1.concat([uint256Coder.encode(value.length), value, padding]);
      }
      function _decodeDynamicBytes(data, offset, localName) {
        if (data.length < offset + 32) {
          errors.throwError('insufficient data for dynamicBytes length', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: bytes_1.hexlify(data.slice(offset, offset + 32))
          });
        }
        var length = uint256Coder.decode(data, offset).value;
        try {
          length = length.toNumber();
        } catch (error) {
          errors.throwError('dynamic bytes count too large', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: length.toString()
          });
        }
        if (data.length < offset + 32 + length) {
          errors.throwError('insufficient data for dynamicBytes type', errors.INVALID_ARGUMENT, {
            arg: localName,
            coderType: 'dynamicBytes',
            value: bytes_1.hexlify(data.slice(offset, offset + 32 + length))
          });
        }
        return {
          consumed: 32 + 32 * Math.ceil(length / 32),
          value: data.slice(offset + 32, offset + 32 + length)
        };
      }
      var CoderDynamicBytes = /** @class */function (_super) {
        __extends(CoderDynamicBytes, _super);
        function CoderDynamicBytes(coerceFunc, localName) {
          return _super.call(this, coerceFunc, 'bytes', 'bytes', localName, true) || this;
        }
        CoderDynamicBytes.prototype.encode = function (value) {
          try {
            return _encodeDynamicBytes(bytes_1.arrayify(value));
          } catch (error) {
            errors.throwError('invalid bytes value', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: 'bytes',
              value: error.value
            });
          }
          return null;
        };
        CoderDynamicBytes.prototype.decode = function (data, offset) {
          var result = _decodeDynamicBytes(data, offset, this.localName);
          result.value = this.coerceFunc('bytes', bytes_1.hexlify(result.value));
          return result;
        };
        return CoderDynamicBytes;
      }(Coder);
      var CoderString = /** @class */function (_super) {
        __extends(CoderString, _super);
        function CoderString(coerceFunc, localName) {
          return _super.call(this, coerceFunc, 'string', 'string', localName, true) || this;
        }
        CoderString.prototype.encode = function (value) {
          if (typeof value !== 'string') {
            errors.throwError('invalid string value', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: 'string',
              value: value
            });
          }
          return _encodeDynamicBytes(utf8_1.toUtf8Bytes(value));
        };
        CoderString.prototype.decode = function (data, offset) {
          var result = _decodeDynamicBytes(data, offset, this.localName);
          result.value = this.coerceFunc('string', utf8_1.toUtf8String(result.value));
          return result;
        };
        return CoderString;
      }(Coder);
      function alignSize(size) {
        return 32 * Math.ceil(size / 32);
      }
      function pack(coders, values) {
        if (Array.isArray(values)) {
          // do nothing
        } else if (values && (typeof values === "undefined" ? "undefined" : _typeof(values)) === 'object') {
          var arrayValues = [];
          coders.forEach(function (coder) {
            arrayValues.push(values[coder.localName]);
          });
          values = arrayValues;
        } else {
          errors.throwError('invalid tuple value', errors.INVALID_ARGUMENT, {
            coderType: 'tuple',
            value: values
          });
        }
        if (coders.length !== values.length) {
          errors.throwError('types/value length mismatch', errors.INVALID_ARGUMENT, {
            coderType: 'tuple',
            value: values
          });
        }
        var parts = [];
        coders.forEach(function (coder, index) {
          parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) });
        });
        var staticSize = 0,
            dynamicSize = 0;
        parts.forEach(function (part) {
          if (part.dynamic) {
            staticSize += 32;
            dynamicSize += alignSize(part.value.length);
          } else {
            staticSize += alignSize(part.value.length);
          }
        });
        var offset = 0,
            dynamicOffset = staticSize;
        var data = new Uint8Array(staticSize + dynamicSize);
        parts.forEach(function (part) {
          if (part.dynamic) {
            //uint256Coder.encode(dynamicOffset).copy(data, offset);
            data.set(uint256Coder.encode(dynamicOffset), offset);
            offset += 32;
            //part.value.copy(data, dynamicOffset);  @TODO
            data.set(part.value, dynamicOffset);
            dynamicOffset += alignSize(part.value.length);
          } else {
            //part.value.copy(data, offset);  @TODO
            data.set(part.value, offset);
            offset += alignSize(part.value.length);
          }
        });
        return data;
      }
      function unpack(coders, data, offset) {
        var baseOffset = offset;
        var consumed = 0;
        var value = [];
        coders.forEach(function (coder) {
          if (coder.dynamic) {
            var dynamicOffset = uint256Coder.decode(data, offset);
            var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber());
            // The dynamic part is leap-frogged somewhere else; doesn't count towards size
            result.consumed = dynamicOffset.consumed;
          } else {
            var result = coder.decode(data, offset);
          }
          if (result.value != undefined) {
            value.push(result.value);
          }
          offset += result.consumed;
          consumed += result.consumed;
        });
        coders.forEach(function (coder, index) {
          var name = coder.localName;
          if (!name) {
            return;
          }
          if (name === 'length') {
            name = '_length';
          }
          if (value[name] != null) {
            return;
          }
          value[name] = value[index];
        });
        return {
          value: value,
          consumed: consumed
        };
      }
      var CoderArray = /** @class */function (_super) {
        __extends(CoderArray, _super);
        function CoderArray(coerceFunc, coder, length, localName) {
          var _this = this;
          var type = coder.type + '[' + (length >= 0 ? length : '') + ']';
          var dynamic = length === -1 || coder.dynamic;
          _this = _super.call(this, coerceFunc, 'array', type, localName, dynamic) || this;
          _this.coder = coder;
          _this.length = length;
          return _this;
        }
        CoderArray.prototype.encode = function (value) {
          if (!Array.isArray(value)) {
            errors.throwError('expected array value', errors.INVALID_ARGUMENT, {
              arg: this.localName,
              coderType: 'array',
              value: value
            });
          }
          var count = this.length;
          var result = new Uint8Array(0);
          if (count === -1) {
            count = value.length;
            result = uint256Coder.encode(count);
          }
          errors.checkArgumentCount(count, value.length, 'in coder array' + (this.localName ? " " + this.localName : ""));
          var coders = [];
          for (var i = 0; i < value.length; i++) {
            coders.push(this.coder);
          }
          return bytes_1.concat([result, pack(coders, value)]);
        };
        CoderArray.prototype.decode = function (data, offset) {
          // @TODO:
          //if (data.length < offset + length * 32) { throw new Error('invalid array'); }
          var consumed = 0;
          var count = this.length;
          if (count === -1) {
            try {
              var decodedLength = uint256Coder.decode(data, offset);
            } catch (error) {
              errors.throwError('insufficient data for dynamic array length', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                value: error.value
              });
            }
            try {
              count = decodedLength.value.toNumber();
            } catch (error) {
              errors.throwError('array count too large', errors.INVALID_ARGUMENT, {
                arg: this.localName,
                coderType: 'array',
                value: decodedLength.value.toString()
              });
            }
            consumed += decodedLength.consumed;
            offset += decodedLength.consumed;
          }
          var coders = [];
          for (var i = 0; i < count; i++) {
            coders.push(new CoderAnonymous(this.coder));
          }
          var result = unpack(coders, data, offset);
          result.consumed += consumed;
          result.value = this.coerceFunc(this.type, result.value);
          return result;
        };
        return CoderArray;
      }(Coder);
      var CoderTuple = /** @class */function (_super) {
        __extends(CoderTuple, _super);
        function CoderTuple(coerceFunc, coders, localName) {
          var _this = this;
          var dynamic = false;
          var types = [];
          coders.forEach(function (coder) {
            if (coder.dynamic) {
              dynamic = true;
            }
            types.push(coder.type);
          });
          var type = 'tuple(' + types.join(',') + ')';
          _this = _super.call(this, coerceFunc, 'tuple', type, localName, dynamic) || this;
          _this.coders = coders;
          return _this;
        }
        CoderTuple.prototype.encode = function (value) {
          return pack(this.coders, value);
        };
        CoderTuple.prototype.decode = function (data, offset) {
          var result = unpack(this.coders, data, offset);
          result.value = this.coerceFunc(this.type, result.value);
          return result;
        };
        return CoderTuple;
      }(Coder);
      /*
      function getTypes(coders) {
          var type = coderTuple(coders).type;
          return type.substring(6, type.length - 1);
      }
      */
      function splitNesting(value) {
        var result = [];
        var accum = '';
        var depth = 0;
        for (var offset = 0; offset < value.length; offset++) {
          var c = value[offset];
          if (c === ',' && depth === 0) {
            result.push(accum);
            accum = '';
          } else {
            accum += c;
            if (c === '(') {
              depth++;
            } else if (c === ')') {
              depth--;
              if (depth === -1) {
                throw new Error('unbalanced parenthsis');
              }
            }
          }
        }
        result.push(accum);
        return result;
      }
      // @TODO: Is there a way to return "class"?
      var paramTypeSimple = {
        address: CoderAddress,
        bool: CoderBoolean,
        string: CoderString,
        bytes: CoderDynamicBytes
      };
      function getTupleParamCoder(coerceFunc, components, localName) {
        if (!components) {
          components = [];
        }
        var coders = [];
        components.forEach(function (component) {
          coders.push(getParamCoder(coerceFunc, component));
        });
        return new CoderTuple(coerceFunc, coders, localName);
      }
      function getParamCoder(coerceFunc, param) {
        var coder = paramTypeSimple[param.type];
        if (coder) {
          return new coder(coerceFunc, param.name);
        }
        var match = param.type.match(paramTypeNumber);
        if (match) {
          var size = parseInt(match[2] || "256");
          if (size === 0 || size > 256 || size % 8 !== 0) {
            errors.throwError('invalid ' + match[1] + ' bit length', errors.INVALID_ARGUMENT, {
              arg: 'param',
              value: param
            });
          }
          return new CoderNumber(coerceFunc, size / 8, match[1] === 'int', param.name);
        }
        var match = param.type.match(paramTypeBytes);
        if (match) {
          var size = parseInt(match[1]);
          if (size === 0 || size > 32) {
            errors.throwError('invalid bytes length', errors.INVALID_ARGUMENT, {
              arg: 'param',
              value: param
            });
          }
          return new CoderFixedBytes(coerceFunc, size, param.name);
        }
        var match = param.type.match(paramTypeArray);
        if (match) {
          var size = parseInt(match[2] || "-1");
          param = properties_1.jsonCopy(param);
          param.type = match[1];
          return new CoderArray(coerceFunc, getParamCoder(coerceFunc, param), size, param.name);
        }
        if (param.type.substring(0, 5) === 'tuple') {
          return getTupleParamCoder(coerceFunc, param.components, param.name);
        }
        if (param.type === '') {
          return new CoderNull(coerceFunc, param.name);
        }
        errors.throwError('invalid type', errors.INVALID_ARGUMENT, {
          arg: 'type',
          value: param.type
        });
        return null;
      }
      var AbiCoder = /** @class */function () {
        function AbiCoder(coerceFunc) {
          errors.checkNew(this, AbiCoder);
          if (!coerceFunc) {
            coerceFunc = exports.defaultCoerceFunc;
          }
          properties_1.defineReadOnly(this, 'coerceFunc', coerceFunc);
        }
        AbiCoder.prototype.encode = function (types, values) {
          if (types.length !== values.length) {
            errors.throwError('types/values length mismatch', errors.INVALID_ARGUMENT, {
              count: { types: types.length, values: values.length },
              value: { types: types, values: values }
            });
          }
          var coders = [];
          types.forEach(function (type) {
            // Convert types to type objects
            //   - "uint foo" => { type: "uint", name: "foo" }
            //   - "tuple(uint, uint)" => { type: "tuple", components: [ { type: "uint" }, { type: "uint" }, ] }
            var typeObject = null;
            if (typeof type === 'string') {
              typeObject = parseParam(type);
            } else {
              typeObject = type;
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
          }, this);
          return bytes_1.hexlify(new CoderTuple(this.coerceFunc, coders, '_').encode(values));
        };
        AbiCoder.prototype.decode = function (types, data) {
          var coders = [];
          types.forEach(function (type) {
            // See encode for details
            var typeObject = null;
            if (typeof type === 'string') {
              typeObject = parseParam(type);
            } else {
              typeObject = properties_1.jsonCopy(type);
            }
            coders.push(getParamCoder(this.coerceFunc, typeObject));
          }, this);
          return new CoderTuple(this.coerceFunc, coders, '_').decode(bytes_1.arrayify(data), 0).value;
        };
        return AbiCoder;
      }();
      exports.AbiCoder = AbiCoder;
      exports.defaultAbiCoder = new AbiCoder();
    }, { "./address": 5, "./bignumber": 6, "./bytes": 7, "./errors": 8, "./properties": 10, "./utf8": 13 }], 5: [function (require, module, exports) {
      'use strict';

      var __importDefault = this && this.__importDefault || function (mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      // We use this for base 36 maths
      var bn_js_1 = __importDefault(require("bn.js"));
      var bytes_1 = require("./bytes");
      var keccak256_1 = require("./keccak256");
      var rlp_1 = require("./rlp");
      var errors = require("./errors");
      function getChecksumAddress(address) {
        if (typeof address !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
          errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        address = address.toLowerCase();
        var chars = address.substring(2).split('');
        var hashed = new Uint8Array(40);
        for (var i_1 = 0; i_1 < 40; i_1++) {
          hashed[i_1] = chars[i_1].charCodeAt(0);
        }
        hashed = bytes_1.arrayify(keccak256_1.keccak256(hashed));
        for (var i = 0; i < 40; i += 2) {
          if (hashed[i >> 1] >> 4 >= 8) {
            chars[i] = chars[i].toUpperCase();
          }
          if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
          }
        }
        return '0x' + chars.join('');
      }
      // Shims for environments that are missing some required constants and functions
      var MAX_SAFE_INTEGER = 0x1fffffffffffff;
      function log10(x) {
        if (Math.log10) {
          return Math.log10(x);
        }
        return Math.log(x) / Math.LN10;
      }
      // See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
      // Create lookup table
      var ibanLookup = {};
      for (var i = 0; i < 10; i++) {
        ibanLookup[String(i)] = String(i);
      }
      for (var i = 0; i < 26; i++) {
        ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
      }
      // How many decimal digits can we process? (for 64-bit float, this is 15)
      var safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
      function ibanChecksum(address) {
        address = address.toUpperCase();
        address = address.substring(4) + address.substring(0, 2) + '00';
        var expanded = '';
        address.split('').forEach(function (c) {
          expanded += ibanLookup[c];
        });
        // Javascript can handle integers safely up to 15 (decimal) digits
        while (expanded.length >= safeDigits) {
          var block = expanded.substring(0, safeDigits);
          expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
        }
        var checksum = String(98 - parseInt(expanded, 10) % 97);
        while (checksum.length < 2) {
          checksum = '0' + checksum;
        }
        return checksum;
      }
      ;
      function getAddress(address) {
        var result = null;
        if (typeof address !== 'string') {
          errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
          // Missing the 0x prefix
          if (address.substring(0, 2) !== '0x') {
            address = '0x' + address;
          }
          result = getChecksumAddress(address);
          // It is a checksummed address with a bad checksum
          if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            errors.throwError('bad address checksum', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
          }
          // Maybe ICAP? (we only support direct mode)
        } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
          // It is an ICAP address with a bad checksum
          if (address.substring(2, 4) !== ibanChecksum(address)) {
            errors.throwError('bad icap checksum', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
          }
          result = new bn_js_1.default.BN(address.substring(4), 36).toString(16);
          while (result.length < 40) {
            result = '0' + result;
          }
          result = getChecksumAddress('0x' + result);
        } else {
          errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        return result;
      }
      exports.getAddress = getAddress;
      function getIcapAddress(address) {
        var base36 = new bn_js_1.default.BN(getAddress(address).substring(2), 16).toString(36).toUpperCase();
        while (base36.length < 30) {
          base36 = '0' + base36;
        }
        return 'XE' + ibanChecksum('XE00' + base36) + base36;
      }
      exports.getIcapAddress = getIcapAddress;
      // http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
      function getContractAddress(transaction) {
        if (!transaction.from) {
          throw new Error('missing from address');
        }
        var nonce = transaction.nonce;
        return getAddress('0x' + keccak256_1.keccak256(rlp_1.encode([getAddress(transaction.from), bytes_1.stripZeros(bytes_1.hexlify(nonce))])).substring(26));
      }
      exports.getContractAddress = getContractAddress;
    }, { "./bytes": 7, "./errors": 8, "./keccak256": 9, "./rlp": 11, "bn.js": "BN" }], 6: [function (require, module, exports) {
      'use strict';

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
      var __importDefault = this && this.__importDefault || function (mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      var __importStar = this && this.__importStar || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) {
          if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }result["default"] = mod;
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      /**
       *  BigNumber
       *
       *  A wrapper around the BN.js object. We use the BN.js library
       *  because it is used by elliptic, so it is required regardles.
       *
       */
      var bn_js_1 = __importDefault(require("bn.js"));
      var bytes_1 = require("./bytes");
      var properties_1 = require("./properties");
      var types_1 = require("./types");
      var errors = __importStar(require("./errors"));
      var BN_1 = new bn_js_1.default.BN(-1);
      function toHex(bn) {
        var value = bn.toString(16);
        if (value[0] === '-') {
          if (value.length % 2 === 0) {
            return '-0x0' + value.substring(1);
          }
          return "-0x" + value.substring(1);
        }
        if (value.length % 2 === 1) {
          return '0x0' + value;
        }
        return '0x' + value;
      }
      function toBN(value) {
        return bigNumberify(value)._bn;
      }
      function toBigNumber(bn) {
        return new BigNumber(toHex(bn));
      }
      var BigNumber = /** @class */function (_super) {
        __extends(BigNumber, _super);
        function BigNumber(value) {
          var _this = _super.call(this) || this;
          errors.checkNew(_this, BigNumber);
          if (typeof value === 'string') {
            if (bytes_1.isHexString(value)) {
              if (value == '0x') {
                value = '0x0';
              }
              properties_1.defineReadOnly(_this, '_hex', value);
            } else if (value[0] === '-' && bytes_1.isHexString(value.substring(1))) {
              properties_1.defineReadOnly(_this, '_hex', value);
            } else if (value.match(/^-?[0-9]*$/)) {
              if (value == '') {
                value = '0';
              }
              properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(value)));
            } else {
              errors.throwError('invalid BigNumber string value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
            }
          } else if (typeof value === 'number') {
            if (parseInt(String(value)) !== value) {
              errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: parseInt(String(value)) });
            }
            try {
              properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(value)));
            } catch (error) {
              errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }
          } else if (value instanceof BigNumber) {
            properties_1.defineReadOnly(_this, '_hex', value._hex);
          } else if (value.toHexString) {
            properties_1.defineReadOnly(_this, '_hex', toHex(toBN(value.toHexString())));
          } else if (bytes_1.isArrayish(value)) {
            properties_1.defineReadOnly(_this, '_hex', toHex(new bn_js_1.default.BN(bytes_1.hexlify(value).substring(2), 16)));
          } else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          return _this;
        }
        Object.defineProperty(BigNumber.prototype, "_bn", {
          get: function get() {
            if (this._hex[0] === '-') {
              return new bn_js_1.default.BN(this._hex.substring(3), 16).mul(BN_1);
            }
            return new bn_js_1.default.BN(this._hex.substring(2), 16);
          },
          enumerable: true,
          configurable: true
        });
        BigNumber.prototype.fromTwos = function (value) {
          return toBigNumber(this._bn.fromTwos(value));
        };
        BigNumber.prototype.toTwos = function (value) {
          return toBigNumber(this._bn.toTwos(value));
        };
        BigNumber.prototype.add = function (other) {
          return toBigNumber(this._bn.add(toBN(other)));
        };
        BigNumber.prototype.sub = function (other) {
          return toBigNumber(this._bn.sub(toBN(other)));
        };
        BigNumber.prototype.div = function (other) {
          var o = bigNumberify(other);
          if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
          }
          return toBigNumber(this._bn.div(toBN(other)));
        };
        BigNumber.prototype.mul = function (other) {
          return toBigNumber(this._bn.mul(toBN(other)));
        };
        BigNumber.prototype.mod = function (other) {
          return toBigNumber(this._bn.mod(toBN(other)));
        };
        BigNumber.prototype.pow = function (other) {
          return toBigNumber(this._bn.pow(toBN(other)));
        };
        BigNumber.prototype.maskn = function (value) {
          return toBigNumber(this._bn.maskn(value));
        };
        BigNumber.prototype.eq = function (other) {
          return this._bn.eq(toBN(other));
        };
        BigNumber.prototype.lt = function (other) {
          return this._bn.lt(toBN(other));
        };
        BigNumber.prototype.lte = function (other) {
          return this._bn.lte(toBN(other));
        };
        BigNumber.prototype.gt = function (other) {
          return this._bn.gt(toBN(other));
        };
        BigNumber.prototype.gte = function (other) {
          return this._bn.gte(toBN(other));
        };
        BigNumber.prototype.isZero = function () {
          return this._bn.isZero();
        };
        BigNumber.prototype.toNumber = function () {
          try {
            return this._bn.toNumber();
          } catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
          }
          return null;
        };
        BigNumber.prototype.toString = function () {
          return this._bn.toString(10);
        };
        BigNumber.prototype.toHexString = function () {
          return this._hex;
        };
        return BigNumber;
      }(types_1.BigNumber);
      function bigNumberify(value) {
        if (value instanceof BigNumber) {
          return value;
        }
        return new BigNumber(value);
      }
      exports.bigNumberify = bigNumberify;
      exports.ConstantNegativeOne = bigNumberify(-1);
      exports.ConstantZero = bigNumberify(0);
      exports.ConstantOne = bigNumberify(1);
      exports.ConstantTwo = bigNumberify(2);
      exports.ConstantWeiPerEther = bigNumberify('1000000000000000000');
    }, { "./bytes": 7, "./errors": 8, "./properties": 10, "./types": 12, "bn.js": "BN" }], 7: [function (require, module, exports) {
      "use strict";
      /**
       *  Conversion Utilities
       *
       */

      Object.defineProperty(exports, "__esModule", { value: true });
      var errors = require("./errors");
      exports.AddressZero = '0x0000000000000000000000000000000000000000';
      exports.HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';
      function isBigNumber(value) {
        return !!value._bn;
      }
      function addSlice(array) {
        if (array.slice) {
          return array;
        }
        array.slice = function () {
          var args = Array.prototype.slice.call(arguments);
          return new Uint8Array(Array.prototype.slice.apply(array, args));
        };
        return array;
      }
      function isArrayish(value) {
        if (!value || parseInt(String(value.length)) != value.length || typeof value === 'string') {
          return false;
        }
        for (var i = 0; i < value.length; i++) {
          var v = value[i];
          if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
            return false;
          }
        }
        return true;
      }
      exports.isArrayish = isArrayish;
      function arrayify(value) {
        if (value == null) {
          errors.throwError('cannot convert null value to array', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (isBigNumber(value)) {
          value = value.toHexString();
        }
        if (typeof value === 'string') {
          var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
          if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          if (match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          value = value.substring(2);
          if (value.length % 2) {
            value = '0' + value;
          }
          var result = [];
          for (var i = 0; i < value.length; i += 2) {
            result.push(parseInt(value.substr(i, 2), 16));
          }
          return addSlice(new Uint8Array(result));
        } else if (typeof value === 'string') {}
        if (isArrayish(value)) {
          return addSlice(new Uint8Array(value));
        }
        errors.throwError('invalid arrayify value', null, { arg: 'value', value: value, type: typeof value === "undefined" ? "undefined" : _typeof(value) });
        return null;
      }
      exports.arrayify = arrayify;
      function concat(objects) {
        var arrays = [];
        var length = 0;
        for (var i = 0; i < objects.length; i++) {
          var object = arrayify(objects[i]);
          arrays.push(object);
          length += object.length;
        }
        var result = new Uint8Array(length);
        var offset = 0;
        for (var i = 0; i < arrays.length; i++) {
          result.set(arrays[i], offset);
          offset += arrays[i].length;
        }
        return addSlice(result);
      }
      exports.concat = concat;
      function stripZeros(value) {
        var result = arrayify(value);
        if (result.length === 0) {
          return result;
        }
        // Find the first non-zero entry
        var start = 0;
        while (result[start] === 0) {
          start++;
        }
        // If we started with zeros, strip them
        if (start) {
          result = result.slice(start);
        }
        return result;
      }
      exports.stripZeros = stripZeros;
      function padZeros(value, length) {
        value = arrayify(value);
        if (length < value.length) {
          throw new Error('cannot pad');
        }
        var result = new Uint8Array(length);
        result.set(value, length - value.length);
        return addSlice(result);
      }
      exports.padZeros = padZeros;
      function isHexString(value, length) {
        if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
          return false;
        }
        if (length && value.length !== 2 + 2 * length) {
          return false;
        }
        return true;
      }
      exports.isHexString = isHexString;
      var HexCharacters = '0123456789abcdef';
      function hexlify(value) {
        if (isBigNumber(value)) {
          return value.toHexString();
        }
        if (typeof value === 'number') {
          if (value < 0) {
            errors.throwError('cannot hexlify negative value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          var hex = '';
          while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
          }
          if (hex.length) {
            if (hex.length % 2) {
              hex = '0' + hex;
            }
            return '0x' + hex;
          }
          return '0x00';
        }
        if (typeof value === 'string') {
          var match = value.match(/^(0x)?[0-9a-fA-F]*$/);
          if (!match) {
            errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          if (match[1] !== '0x') {
            errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
          }
          if (value.length % 2) {
            value = '0x0' + value.substring(2);
          }
          return value;
        }
        if (isArrayish(value)) {
          var result = [];
          for (var i = 0; i < value.length; i++) {
            var v = value[i];
            result.push(HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f]);
          }
          return '0x' + result.join('');
        }
        errors.throwError('invalid hexlify value', null, { arg: 'value', value: value });
        return 'never';
      }
      exports.hexlify = hexlify;
      function hexDataLength(data) {
        if (!isHexString(data) || data.length % 2 !== 0) {
          return null;
        }
        return (data.length - 2) / 2;
      }
      exports.hexDataLength = hexDataLength;
      function hexDataSlice(data, offset, length) {
        if (!isHexString(data)) {
          errors.throwError('invalid hex data', errors.INVALID_ARGUMENT, { arg: 'value', value: data });
        }
        if (data.length % 2 !== 0) {
          errors.throwError('hex data length must be even', errors.INVALID_ARGUMENT, { arg: 'value', value: data });
        }
        offset = 2 + 2 * offset;
        if (length != null) {
          return '0x' + data.substring(offset, offset + 2 * length);
        }
        return '0x' + data.substring(offset);
      }
      exports.hexDataSlice = hexDataSlice;
      function hexStripZeros(value) {
        if (!isHexString(value)) {
          errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        while (value.length > 3 && value.substring(0, 3) === '0x0') {
          value = '0x' + value.substring(3);
        }
        return value;
      }
      exports.hexStripZeros = hexStripZeros;
      function hexZeroPad(value, length) {
        if (!isHexString(value)) {
          errors.throwError('invalid hex string', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        while (value.length < 2 * length + 2) {
          value = '0x0' + value.substring(2);
        }
        return value;
      }
      exports.hexZeroPad = hexZeroPad;
      function isSignature(value) {
        return value && value.r != null && value.s != null;
      }
      function splitSignature(signature) {
        var v = 0;
        var r = '0x',
            s = '0x';
        if (isSignature(signature)) {
          if (signature.v == null && signature.recoveryParam == null) {
            errors.throwError('at least on of recoveryParam or v must be specified', errors.INVALID_ARGUMENT, { argument: 'signature', value: signature });
          }
          r = hexZeroPad(signature.r, 32);
          s = hexZeroPad(signature.s, 32);
          v = signature.v;
          if (typeof v === 'string') {
            v = parseInt(v, 16);
          }
          var recoveryParam = signature.recoveryParam;
          if (recoveryParam == null && signature.v != null) {
            recoveryParam = 1 - v % 2;
          }
          v = 27 + recoveryParam;
        } else {
          var bytes = arrayify(signature);
          if (bytes.length !== 65) {
            throw new Error('invalid signature');
          }
          r = hexlify(bytes.slice(0, 32));
          s = hexlify(bytes.slice(32, 64));
          v = bytes[64];
          if (v !== 27 && v !== 28) {
            v = 27 + v % 2;
          }
        }
        return {
          r: r,
          s: s,
          recoveryParam: v - 27,
          v: v
        };
      }
      exports.splitSignature = splitSignature;
      function joinSignature(signature) {
        signature = splitSignature(signature);
        return hexlify(concat([signature.r, signature.s, signature.recoveryParam ? '0x1c' : '0x1b']));
      }
      exports.joinSignature = joinSignature;
    }, { "./errors": 8 }], 8: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", { value: true });
      // Unknown Error
      exports.UNKNOWN_ERROR = 'UNKNOWN_ERROR';
      // Not implemented
      exports.NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';
      // Missing new operator to an object
      //  - name: The name of the class
      exports.MISSING_NEW = 'MISSING_NEW';
      // Call exception
      //  - transaction: the transaction
      //  - address?: the contract address
      //  - args?: The arguments passed into the function
      //  - method?: The Solidity method signature
      //  - errorSignature?: The EIP848 error signature
      //  - errorArgs?: The EIP848 error parameters
      //  - reason: The reason (only for EIP848 "Error(string)")
      exports.CALL_EXCEPTION = 'CALL_EXCEPTION';
      // Response from a server was invalid
      //   - response: The body of the response
      //'BAD_RESPONSE',
      // Invalid argument (e.g. value is incompatible with type) to a function:
      //   - arg: The argument name that was invalid
      //   - value: The value of the argument
      exports.INVALID_ARGUMENT = 'INVALID_ARGUMENT';
      // Missing argument to a function:
      //   - count: The number of arguments received
      //   - expectedCount: The number of arguments expected
      exports.MISSING_ARGUMENT = 'MISSING_ARGUMENT';
      // Too many arguments
      //   - count: The number of arguments received
      //   - expectedCount: The number of arguments expected
      exports.UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT';
      // Numeric Fault
      //   - operation: the operation being executed
      //   - fault: the reason this faulted
      exports.NUMERIC_FAULT = 'NUMERIC_FAULT';
      // Unsupported operation
      //   - operation
      exports.UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION';
      var _permanentCensorErrors = false;
      var _censorErrors = false;
      // @TODO: Enum
      function throwError(message, code, params) {
        if (_censorErrors) {
          throw new Error('unknown error');
        }
        if (!code) {
          code = exports.UNKNOWN_ERROR;
        }
        if (!params) {
          params = {};
        }
        var messageDetails = [];
        Object.keys(params).forEach(function (key) {
          try {
            messageDetails.push(key + '=' + JSON.stringify(params[key]));
          } catch (error) {
            messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
          }
        });
        var reason = message;
        if (messageDetails.length) {
          message += ' (' + messageDetails.join(', ') + ')';
        }
        // @TODO: Any??
        var error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
          error[key] = params[key];
        });
        throw error;
      }
      exports.throwError = throwError;
      function checkNew(self, kind) {
        if (!(self instanceof kind)) {
          throwError('missing new', exports.MISSING_NEW, { name: kind.name });
        }
      }
      exports.checkNew = checkNew;
      function checkArgumentCount(count, expectedCount, suffix) {
        if (!suffix) {
          suffix = '';
        }
        if (count < expectedCount) {
          throwError('missing argument' + suffix, exports.MISSING_ARGUMENT, { count: count, expectedCount: expectedCount });
        }
        if (count > expectedCount) {
          throwError('too many arguments' + suffix, exports.UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount });
        }
      }
      exports.checkArgumentCount = checkArgumentCount;
      function setCensorship(censorship, permanent) {
        if (_permanentCensorErrors) {
          throwError('error censorship permanent', exports.UNSUPPORTED_OPERATION, { operation: 'setCersorship' });
        }
        _censorErrors = !!censorship;
        _permanentCensorErrors = !!permanent;
      }
      exports.setCensorship = setCensorship;
    }, {}], 9: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", { value: true });
      var sha3 = require("js-sha3");
      var bytes_1 = require("./bytes");
      function keccak256(data) {
        return '0x' + sha3.keccak_256(bytes_1.arrayify(data));
      }
      exports.keccak256 = keccak256;
    }, { "./bytes": 7, "js-sha3": 3 }], 10: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", { value: true });
      function defineReadOnly(object, name, value) {
        Object.defineProperty(object, name, {
          enumerable: true,
          value: value,
          writable: false
        });
      }
      exports.defineReadOnly = defineReadOnly;
      function defineFrozen(object, name, value) {
        var frozen = JSON.stringify(value);
        Object.defineProperty(object, name, {
          enumerable: true,
          get: function get() {
            return JSON.parse(frozen);
          }
        });
      }
      exports.defineFrozen = defineFrozen;
      function resolveProperties(object) {
        var result = {};
        var promises = [];
        Object.keys(object).forEach(function (key) {
          var value = object[key];
          if (value instanceof Promise) {
            promises.push(value.then(function (value) {
              result[key] = value;
              return null;
            }));
          } else {
            result[key] = value;
          }
        });
        return Promise.all(promises).then(function () {
          return result;
        });
      }
      exports.resolveProperties = resolveProperties;
      function shallowCopy(object) {
        var result = {};
        for (var key in object) {
          result[key] = object[key];
        }
        return result;
      }
      exports.shallowCopy = shallowCopy;
      function jsonCopy(object) {
        return JSON.parse(JSON.stringify(object));
      }
      exports.jsonCopy = jsonCopy;
    }, {}], 11: [function (require, module, exports) {
      "use strict";
      //See: https://github.com/ethereum/wiki/wiki/RLP

      Object.defineProperty(exports, "__esModule", { value: true });
      var bytes_1 = require("./bytes");
      function arrayifyInteger(value) {
        var result = [];
        while (value) {
          result.unshift(value & 0xff);
          value >>= 8;
        }
        return result;
      }
      function unarrayifyInteger(data, offset, length) {
        var result = 0;
        for (var i = 0; i < length; i++) {
          result = result * 256 + data[offset + i];
        }
        return result;
      }
      function _encode(object) {
        if (Array.isArray(object)) {
          var payload = [];
          object.forEach(function (child) {
            payload = payload.concat(_encode(child));
          });
          if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length);
            return payload;
          }
          var length = arrayifyInteger(payload.length);
          length.unshift(0xf7 + length.length);
          return length.concat(payload);
        }
        var data = Array.prototype.slice.call(bytes_1.arrayify(object));
        if (data.length === 1 && data[0] <= 0x7f) {
          return data;
        } else if (data.length <= 55) {
          data.unshift(0x80 + data.length);
          return data;
        }
        var length = arrayifyInteger(data.length);
        length.unshift(0xb7 + length.length);
        return length.concat(data);
      }
      function encode(object) {
        return bytes_1.hexlify(_encode(object));
      }
      exports.encode = encode;
      function _decodeChildren(data, offset, childOffset, length) {
        var result = [];
        while (childOffset < offset + 1 + length) {
          var decoded = _decode(data, childOffset);
          result.push(decoded.result);
          childOffset += decoded.consumed;
          if (childOffset > offset + 1 + length) {
            throw new Error('invalid rlp');
          }
        }
        return { consumed: 1 + length, result: result };
      }
      // returns { consumed: number, result: Object }
      function _decode(data, offset) {
        if (data.length === 0) {
          throw new Error('invalid rlp data');
        }
        // Array with extra length prefix
        if (data[offset] >= 0xf8) {
          var lengthLength = data[offset] - 0xf7;
          if (offset + 1 + lengthLength > data.length) {
            throw new Error('too short');
          }
          var length = unarrayifyInteger(data, offset + 1, lengthLength);
          if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('to short');
          }
          return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
        } else if (data[offset] >= 0xc0) {
          var length = data[offset] - 0xc0;
          if (offset + 1 + length > data.length) {
            throw new Error('invalid rlp data');
          }
          return _decodeChildren(data, offset, offset + 1, length);
        } else if (data[offset] >= 0xb8) {
          var lengthLength = data[offset] - 0xb7;
          if (offset + 1 + lengthLength > data.length) {
            throw new Error('invalid rlp data');
          }
          var length = unarrayifyInteger(data, offset + 1, lengthLength);
          if (offset + 1 + lengthLength + length > data.length) {
            throw new Error('invalid rlp data');
          }
          var result = bytes_1.hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
          return { consumed: 1 + lengthLength + length, result: result };
        } else if (data[offset] >= 0x80) {
          var length = data[offset] - 0x80;
          if (offset + 1 + length > data.length) {
            throw new Error('invlaid rlp data');
          }
          var result = bytes_1.hexlify(data.slice(offset + 1, offset + 1 + length));
          return { consumed: 1 + length, result: result };
        }
        return { consumed: 1, result: bytes_1.hexlify(data[offset]) };
      }
      function decode(data) {
        var bytes = bytes_1.arrayify(data);
        var decoded = _decode(bytes, 0);
        if (decoded.consumed !== bytes.length) {
          throw new Error('invalid rlp data');
        }
        return decoded.result;
      }
      exports.decode = decode;
    }, { "./bytes": 7 }], 12: [function (require, module, exports) {
      "use strict";
      ///////////////////////////////
      // Bytes

      Object.defineProperty(exports, "__esModule", { value: true });
      ///////////////////////////////
      // BigNumber
      var BigNumber = /** @class */function () {
        function BigNumber() {}
        return BigNumber;
      }();
      exports.BigNumber = BigNumber;
      ;
      ;
      ;
      ///////////////////////////////
      // Interface
      var Indexed = /** @class */function () {
        function Indexed() {}
        return Indexed;
      }();
      exports.Indexed = Indexed;
      /**
       *  Provider
       *
       *  Note: We use an abstract class so we can use instanceof to determine if an
       *        object is a Provider.
       */
      var MinimalProvider = /** @class */function () {
        function MinimalProvider() {}
        return MinimalProvider;
      }();
      exports.MinimalProvider = MinimalProvider;
      /**
       *  Signer
       *
       *  Note: We use an abstract class so we can use instanceof to determine if an
       *        object is a Signer.
       */
      var Signer = /** @class */function () {
        function Signer() {}
        return Signer;
      }();
      exports.Signer = Signer;
      ///////////////////////////////
      // HDNode
      var HDNode = /** @class */function () {
        function HDNode() {}
        return HDNode;
      }();
      exports.HDNode = HDNode;
    }, {}], 13: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", { value: true });
      var bytes_1 = require("./bytes");
      var UnicodeNormalizationForm;
      (function (UnicodeNormalizationForm) {
        UnicodeNormalizationForm["current"] = "";
        UnicodeNormalizationForm["NFC"] = "NFC";
        UnicodeNormalizationForm["NFD"] = "NFD";
        UnicodeNormalizationForm["NFKC"] = "NFKC";
        UnicodeNormalizationForm["NFKD"] = "NFKD";
      })(UnicodeNormalizationForm = exports.UnicodeNormalizationForm || (exports.UnicodeNormalizationForm = {}));
      ;
      // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
      function toUtf8Bytes(str, form) {
        if (form === void 0) {
          form = UnicodeNormalizationForm.current;
        }
        if (form != UnicodeNormalizationForm.current) {
          str = str.normalize(form);
        }
        var result = [];
        var offset = 0;
        for (var i = 0; i < str.length; i++) {
          var c = str.charCodeAt(i);
          if (c < 128) {
            result[offset++] = c;
          } else if (c < 2048) {
            result[offset++] = c >> 6 | 192;
            result[offset++] = c & 63 | 128;
          } else if ((c & 0xFC00) == 0xD800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xFC00) == 0xDC00) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            result[offset++] = c >> 18 | 240;
            result[offset++] = c >> 12 & 63 | 128;
            result[offset++] = c >> 6 & 63 | 128;
            result[offset++] = c & 63 | 128;
          } else {
            result[offset++] = c >> 12 | 224;
            result[offset++] = c >> 6 & 63 | 128;
            result[offset++] = c & 63 | 128;
          }
        }
        return bytes_1.arrayify(result);
      }
      exports.toUtf8Bytes = toUtf8Bytes;
      ;
      // http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
      function toUtf8String(bytes) {
        bytes = bytes_1.arrayify(bytes);
        var result = '';
        var i = 0;
        // Invalid bytes are ignored
        while (i < bytes.length) {
          var c = bytes[i++];
          if (c >> 7 == 0) {
            // 0xxx xxxx
            result += String.fromCharCode(c);
            continue;
          }
          // Invalid starting byte
          if (c >> 6 == 0x02) {
            continue;
          }
          // Multibyte; how many bytes left for thus character?
          var extraLength = null;
          if (c >> 5 == 0x06) {
            extraLength = 1;
          } else if (c >> 4 == 0x0e) {
            extraLength = 2;
          } else if (c >> 3 == 0x1e) {
            extraLength = 3;
          } else if (c >> 2 == 0x3e) {
            extraLength = 4;
          } else if (c >> 1 == 0x7e) {
            extraLength = 5;
          } else {
            continue;
          }
          // Do we have enough bytes in our data?
          if (i + extraLength > bytes.length) {
            // If there is an invalid unprocessed byte, try to continue
            for (; i < bytes.length; i++) {
              if (bytes[i] >> 6 != 0x02) {
                break;
              }
            }
            if (i != bytes.length) continue;
            // All leftover bytes are valid.
            return result;
          }
          // Remove the UTF-8 prefix from the char (res)
          var res = c & (1 << 8 - extraLength - 1) - 1;
          var count;
          for (count = 0; count < extraLength; count++) {
            var nextChar = bytes[i++];
            // Is the char valid multibyte part?
            if (nextChar >> 6 != 0x02) {
              break;
            }
            ;
            res = res << 6 | nextChar & 0x3f;
          }
          if (count != extraLength) {
            i--;
            continue;
          }
          if (res <= 0xffff) {
            result += String.fromCharCode(res);
            continue;
          }
          res -= 0x10000;
          result += String.fromCharCode((res >> 10 & 0x3ff) + 0xd800, (res & 0x3ff) + 0xdc00);
        }
        return result;
      }
      exports.toUtf8String = toUtf8String;
    }, { "./bytes": 7 }], 14: [function (require, module, exports) {
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
    }, { "bn.js": 15, "number-to-bn": 16 }], 15: [function (require, module, exports) {
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
    }, {}], 16: [function (require, module, exports) {
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
    }, { "bn.js": 15, "strip-hex-prefix": 24 }], 17: [function (require, module, exports) {
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
    }, {}], 18: [function (require, module, exports) {
      arguments[4][15][0].apply(exports, arguments);
    }, { "dup": 15 }], 19: [function (require, module, exports) {
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
    }, { "bn.js": 18, "is-hex-prefixed": 17, "strip-hex-prefix": 24 }], 20: [function (require, module, exports) {
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
    }, {}], 21: [function (require, module, exports) {
      module.exports = window.crypto;
    }, {}], 22: [function (require, module, exports) {
      module.exports = require('crypto');
    }, { "crypto": 21 }], 23: [function (require, module, exports) {
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
    }, { "./crypto.js": 22 }], 24: [function (require, module, exports) {
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
    }, { "is-hex-prefixed": 17 }], 25: [function (require, module, exports) {
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
    }, {}], 26: [function (require, module, exports) {
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
    }, {}], 27: [function (require, module, exports) {
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
    }, { "./soliditySha3.js": 28, "./utils.js": 29, "ethjs-unit": 14, "randomhex": 23, "underscore": 25 }], 28: [function (require, module, exports) {
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
    }, { "./utils.js": 29, "bn.js": "BN", "underscore": 25 }], 29: [function (require, module, exports) {
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
    }, { "bn.js": "BN", "eth-lib/lib/hash": 2, "number-to-bn": 19, "underscore": 25, "utf8": 26 }], "BN": [function (require, module, exports) {
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
    }, { "buffer": 1 }], "Web3EthAbi": [function (require, module, exports) {
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
       * @author Marek Kotewicz <marek@parity.io>
       * @author Fabian Vogelsteller <fabian@frozeman.de>
       * @date 2018
       */

      var _ = require('underscore');
      var utils = require('../../web3-utils');

      var EthersAbi = require('ethers/utils/abi-coder').AbiCoder;
      var ethersAbiCoder = new EthersAbi(function (type, value) {
        if (type.match(/^u?int/) && !_.isArray(value) && (!_.isObject(value) || value.constructor.name !== 'BN')) {
          return value.toString();
        }
        return value;
      });

      // result method
      function Result() {}

      /**
       * ABICoder prototype should be used to encode/decode solidity params of any type
       */
      var ABICoder = function ABICoder() {};

      /**
       * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
       *
       * @method encodeFunctionSignature
       * @param {String|Object} functionName
       * @return {String} encoded function name
       */
      ABICoder.prototype.encodeFunctionSignature = function (functionName) {
        if (_.isObject(functionName)) {
          functionName = utils._jsonInterfaceMethodToString(functionName);
        }

        return utils.sha3(functionName).slice(0, 10);
      };

      /**
       * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
       *
       * @method encodeEventSignature
       * @param {String|Object} functionName
       * @return {String} encoded function name
       */
      ABICoder.prototype.encodeEventSignature = function (functionName) {
        if (_.isObject(functionName)) {
          functionName = utils._jsonInterfaceMethodToString(functionName);
        }

        return utils.sha3(functionName);
      };

      /**
       * Should be used to encode plain param
       *
       * @method encodeParameter
       * @param {String} type
       * @param {Object} param
       * @return {String} encoded plain param
       */
      ABICoder.prototype.encodeParameter = function (type, param) {
        return this.encodeParameters([type], [param]);
      };

      /**
       * Should be used to encode list of params
       *
       * @method encodeParameters
       * @param {Array} types
       * @param {Array} params
       * @return {String} encoded list of params
       */
      ABICoder.prototype.encodeParameters = function (types, params) {
        return ethersAbiCoder.encode(this.mapTypes(types), params);
      };

      /**
       * Map types if simplified format is used
       *
       * @method mapTypes
       * @param {Array} types
       * @return {Array}
       */
      ABICoder.prototype.mapTypes = function (types) {
        var self = this;
        var mappedTypes = [];
        types.forEach(function (type) {
          if (self.isSimplifiedStructFormat(type)) {
            var structName = Object.keys(type)[0];
            mappedTypes.push(Object.assign(self.mapStructNameAndType(structName), {
              components: self.mapStructToCoderFormat(type[structName])
            }));

            return;
          }

          mappedTypes.push(type);
        });

        return mappedTypes;
      };

      /**
       * Check if type is simplified struct format
       *
       * @method isSimplifiedStructFormat
       * @param {string | Object} type
       * @returns {boolean}
       */
      ABICoder.prototype.isSimplifiedStructFormat = function (type) {
        return (typeof type === "undefined" ? "undefined" : _typeof(type)) === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined';
      };

      /**
       * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
       *
       * @method mapStructNameAndType
       * @param {string} structName
       * @return {{type: string, name: *}}
       */
      ABICoder.prototype.mapStructNameAndType = function (structName) {
        var type = 'tuple';

        if (structName.indexOf('[]') > -1) {
          type = 'tuple[]';
          structName = structName.slice(0, -2);
        }

        return { type: type, name: structName };
      };

      /**
       * Maps the simplified format in to the expected format of the ABICoder
       *
       * @method mapStructToCoderFormat
       * @param {Object} struct
       * @return {Array}
       */
      ABICoder.prototype.mapStructToCoderFormat = function (struct) {
        var self = this;
        var components = [];
        Object.keys(struct).forEach(function (key) {
          if (_typeof(struct[key]) === 'object') {
            components.push(Object.assign(self.mapStructNameAndType(key), {
              components: self.mapStructToCoderFormat(struct[key])
            }));

            return;
          }

          components.push({
            name: key,
            type: struct[key]
          });
        });

        return components;
      };

      /**
       * Encodes a function call from its json interface and parameters.
       *
       * @method encodeFunctionCall
       * @param {Array} jsonInterface
       * @param {Array} params
       * @return {String} The encoded ABI for this function call
       */
      ABICoder.prototype.encodeFunctionCall = function (jsonInterface, params) {
        return this.encodeFunctionSignature(jsonInterface) + this.encodeParameters(jsonInterface.inputs, params).replace('0x', '');
      };

      /**
       * Should be used to decode bytes to plain param
       *
       * @method decodeParameter
       * @param {String} type
       * @param {String} bytes
       * @return {Object} plain param
       */
      ABICoder.prototype.decodeParameter = function (type, bytes) {
        return this.decodeParameters([type], bytes)[0];
      };

      /**
       * Should be used to decode list of params
       *
       * @method decodeParameter
       * @param {Array} outputs
       * @param {String} bytes
       * @return {Array} array of plain params
       */
      ABICoder.prototype.decodeParameters = function (outputs, bytes) {
        if (!bytes || bytes === '0x' || bytes === '0X') {
          throw new Error('Returned values aren\'t valid, did it run Out of Gas?');
        }

        var res = ethersAbiCoder.decode(this.mapTypes(outputs), '0x' + bytes.replace(/0x/i, ''));
        var returnValue = new Result();
        returnValue.__length__ = 0;

        outputs.forEach(function (output, i) {
          var decodedValue = res[returnValue.__length__];
          decodedValue = decodedValue === '0x' ? null : decodedValue;

          returnValue[i] = decodedValue;

          if (_.isObject(output) && output.name) {
            returnValue[output.name] = decodedValue;
          }

          returnValue.__length__++;
        });

        return returnValue;
      };

      /**
       * Decodes events non- and indexed parameters.
       *
       * @method decodeLog
       * @param {Object} inputs
       * @param {String} data
       * @param {Array} topics
       * @return {Array} array of plain params
       */
      ABICoder.prototype.decodeLog = function (inputs, data, topics) {
        var _this = this;
        topics = _.isArray(topics) ? topics : [topics];

        data = data || '';

        var notIndexedInputs = [];
        var indexedParams = [];
        var topicCount = 0;

        // TODO check for anonymous logs?

        inputs.forEach(function (input, i) {
          if (input.indexed) {
            indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].find(function (staticType) {
              return input.type.indexOf(staticType) !== -1;
            }) ? _this.decodeParameter(input.type, topics[topicCount]) : topics[topicCount];
            topicCount++;
          } else {
            notIndexedInputs[i] = input;
          }
        });

        var nonIndexedData = data;
        var notIndexedParams = nonIndexedData ? this.decodeParameters(notIndexedInputs, nonIndexedData) : [];

        var returnValue = new Result();
        returnValue.__length__ = 0;

        inputs.forEach(function (res, i) {
          returnValue[i] = res.type === 'string' ? '' : null;

          if (typeof notIndexedParams[i] !== 'undefined') {
            returnValue[i] = notIndexedParams[i];
          }
          if (typeof indexedParams[i] !== 'undefined') {
            returnValue[i] = indexedParams[i];
          }

          if (res.name) {
            returnValue[res.name] = returnValue[i];
          }

          returnValue.__length__++;
        });

        return returnValue;
      };

      var coder = new ABICoder();

      module.exports = coder;
    }, { "../../web3-utils": 27, "ethers/utils/abi-coder": 4, "underscore": 25 }] }, {}, ["Web3EthAbi"])("Web3EthAbi");
});
//# sourceMappingURL=web3-eth-abi.js.map