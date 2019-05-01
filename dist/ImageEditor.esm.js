/*!
 * ImageEditor v1.0.0
 * https://github.com/PurpleWave/image-editor#readme
 *
 * Copyright 2019-present Alex Neises
 * Released under the MIT license
 *
 * Date: 2019-05-01T14:48:10.355Z
 */

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var BlurStack = function BlurStack() {
  _classCallCheck(this, BlurStack);

  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};

var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

var ImageEditor =
/*#__PURE__*/
function () {
  function ImageEditor(imgPath, canvas) {
    var _this = this;

    _classCallCheck(this, ImageEditor);

    this.ogPath = imgPath;
    this.canvas = canvas;
    this.img = new Image();
    this.undoStack = [];
    this.redoStack = [];
    this.rect = {};

    this.img.onload = function () {
      var wrh = _this.img.width / _this.img.height;
      _this.newWidth = _this.canvas.width;
      _this.newHeight = _this.newWidth / wrh;

      if (_this.newHeight > _this.canvas.height) {
        _this.newHeight = _this.canvas.height;
        _this.newWidth = _this.newHeight * wrh;
      }

      _this.canvas.width = _this.newWidth;
      _this.canvas.height = _this.newHeight;
      _this.ctx = _this.canvas.getContext('2d');

      _this.ctx.drawImage(_this.img, 0, 0, _this.newWidth, _this.newHeight);

      _this.ctx.save();
    };

    this.addToUndo(imgPath);
    this.img.src = imgPath;
  }

  _createClass(ImageEditor, [{
    key: "getWidth",
    value: function getWidth() {
      return this.newWidth;
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.newHeight;
    }
  }, {
    key: "addToUndo",
    value: function addToUndo(path) {
      this.undoStack.push(path);
    }
  }, {
    key: "addToRedo",
    value: function addToRedo(path) {
      this.redoStack.push(path);
    }
  }, {
    key: "setBoundingOrigin",
    value: function setBoundingOrigin(x, y) {
      this.rect.startX = x;
      this.rect.startY = y;
    }
  }, {
    key: "drawBoundingBox",
    value: function drawBoundingBox(x, y) {
      this.rect.w = x;
      this.rect.h = y;
      this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);
      this.ctx.save();
      this.draw();
      this.ctx.restore();
    }
  }, {
    key: "draw",
    value: function draw() {
      this.ctx.setLineDash([6]);
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    }
  }, {
    key: "setBrightness",
    value: function setBrightness(amount) {
      this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);
      this.ctx.save();

      if (amount < 0) {
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = 'black';
        this.ctx.globalAlpha = -amount / 100;
        this.ctx.fillRect(0, 0, this.newWidth, this.newHeight);
      } else if (amount > 0) {
        this.ctx.fillStyle = 'white';
        this.ctx.globalCompositeOperation = 'lighten';
        this.ctx.globalAlpha = 1;
        this.ctx.globalAlpha = amount / 100;
        this.ctx.fillRect(0, 0, this.newWidth, this.newHeight);
      }

      this.ctx.restore();
    }
  }, {
    key: "apply",
    value: function apply() {
      this.addToUndo(this.canvas.toDataURL());
      this.img.src = this.canvas.toDataURL();
    }
  }, {
    key: "reset",
    value: function reset() {
      this.undoStack = [];
      this.redoStack = [];
      this.addToUndo(this.ogPath);
      this.img.src = this.ogPath;
    }
  }, {
    key: "undo",
    value: function undo() {
      if (this.undoStack.length > 1) {
        this.img.src = this.undoStack[this.undoStack.length - 2];
        this.redoStack.unshift(this.undoStack.pop());
      }
    }
  }, {
    key: "redo",
    value: function redo() {
      if (this.redoStack.length >= 1) {
        this.img.src = this.redoStack[0];
        this.undoStack.push(this.redoStack.shift());
      }
    }
  }, {
    key: "setBlur",
    value: function setBlur(amount) {
      var topLeft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var bottomRight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _topLeft = {
        x: topLeft.x ? topLeft.x : 0,
        y: topLeft.y ? topLeft.y : 0
      };
      var _bottomRight = {
        x: bottomRight.x ? bottomRight.x : this.newWidth,
        y: bottomRight.y ? bottomRight.y : this.newHeight
      };
      var w = Math.abs(_bottomRight.x - _topLeft.x);
      var h = Math.abs(_bottomRight.y - _topLeft.y);
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);

      if (amount >= 1) {
        this._stackBlurCanvasRGBA(amount, _topLeft, w, h);
      } else {
        this.img.src = this.img.src;
      }
    }
  }, {
    key: "_stackBlurCanvasRGBA",
    value: function _stackBlurCanvasRGBA(amount, topLeft, width, height) {
      if (isNaN(amount || amount < 1)) {
        return;
      }

      amount |= 0;
      var imageData = this.ctx.getImageData(topLeft.x, topLeft.y, width, height);
      var pixels = imageData.data;
      var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
      var div = amount + amount + 1;
      var widthMinus1 = width - 1;
      var heightMinus1 = height - 1;
      var radiusPlus1 = amount + 1;
      var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
      var stackStart = new BlurStack();
      var stackEnd;
      var stack = stackStart;

      for (i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();

        if (i == radiusPlus1) {
          stackEnd = stack;
        }
      }

      stack.next = stackStart;
      var stackIn = null;
      var stackOut = null;
      yw = yi = 0;
      var mul_sum = mul_table[amount];
      var shg_sum = shg_table[amount];

      for (y = 0; y < height; y++) {
        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack.a = pa;
          stack = stack.next;
        }

        for (i = 1; i < radiusPlus1; i++) {
          p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
          r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
          b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
          a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          a_in_sum += pa;
          stack = stack.next;
        }

        stackIn = stackStart;
        stackOut = stackEnd;

        for (x = 0; x < width; x++) {
          pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;

          if (pa != 0) {
            pa = 255 / pa;
            pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
            pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
            pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
          } else {
            pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
          }

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          a_sum -= a_out_sum;
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          a_out_sum -= stackIn.a;
          p = yw + ((p = x + amount + 1) < widthMinus1 ? p : widthMinus1) << 2;
          r_in_sum += stackIn.r = pixels[p];
          g_in_sum += stackIn.g = pixels[p + 1];
          b_in_sum += stackIn.b = pixels[p + 2];
          a_in_sum += stackIn.a = pixels[p + 3];
          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;
          a_sum += a_in_sum;
          stackIn = stackIn.next;
          r_out_sum += pr = stackOut.r;
          g_out_sum += pg = stackOut.g;
          b_out_sum += pb = stackOut.b;
          a_out_sum += pa = stackOut.a;
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          a_in_sum -= pa;
          stackOut = stackOut.next;
          yi += 4;
        }

        yw += width;
      }

      for (x = 0; x < width; x++) {
        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;

        for (i = 0; i < radiusPlus1; i++) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack.a = pa;
          stack = stack.next;
        }

        yp = width;

        for (i = 1; i <= amount; i++) {
          yi = yp + x << 2;
          r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
          b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
          a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          a_in_sum += pa;
          stack = stack.next;

          if (i < heightMinus1) {
            yp += width;
          }
        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;

        for (y = 0; y < height; y++) {
          p = yi << 2;
          pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;

          if (pa > 0) {
            pa = 255 / pa;
            pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
            pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
            pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
          } else {
            pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
          }

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          a_sum -= a_out_sum;
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          a_out_sum -= stackIn.a;
          p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
          r_sum += r_in_sum += stackIn.r = pixels[p];
          g_sum += g_in_sum += stackIn.g = pixels[p + 1];
          b_sum += b_in_sum += stackIn.b = pixels[p + 2];
          a_sum += a_in_sum += stackIn.a = pixels[p + 3];
          stackIn = stackIn.next;
          r_out_sum += pr = stackOut.r;
          g_out_sum += pg = stackOut.g;
          b_out_sum += pb = stackOut.b;
          a_out_sum += pa = stackOut.a;
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          a_in_sum -= pa;
          stackOut = stackOut.next;
          yi += width;
        }
      }

      this.ctx.putImageData(imageData, topLeft.x, topLeft.y);
    }
  }]);

  return ImageEditor;
}();

export default ImageEditor;
