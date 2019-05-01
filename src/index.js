import BlurStack from './filters/blur/blurStack';
import { mul_table, shg_table } from './filters/blur/helpers';

class ImageEditor {
  constructor(imgPath, canvas) {
    this.ogPath = imgPath;
    this.canvas = canvas;
    this.img = new Image();
    this.undoStack = [];
    this.redoStack = [];
    this.rect = {};
    this.img.onload = () => {
      const wrh = this.img.width / this.img.height;
      this.newWidth = this.canvas.width;
      this.newHeight = this.newWidth / wrh;
      if (this.newHeight > this.canvas.height) {
        this.newHeight = this.canvas.height;
        this.newWidth = this.newHeight * wrh;
      }
      this.canvas.width = this.newWidth;
      this.canvas.height = this.newHeight;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);
      this.ctx.save();
    }
    this.addToUndo(imgPath);
    this.img.src = imgPath;
  }

  getWidth() {
    return this.newWidth;
  }

  getHeight() {
    return this.newHeight;
  }

  addToUndo(path) {
    this.undoStack.push(path);
  }

  addToRedo(path) {
    this.redoStack.push(path);
  }

  setBoundingOrigin(x, y) {
    this.rect.startX = x;
    this.rect.startY = y;
  }

  drawBoundingBox(x, y) {
    this.rect.w = x;
    this.rect.h = y;
    this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);
    this.ctx.save();
    this.draw();
    this.ctx.restore();
  }

  draw() {
    this.ctx.setLineDash([6]);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }

  setBrightness(amount) {
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

  apply() {
    this.addToUndo(this.canvas.toDataURL());
    this.img.src = this.canvas.toDataURL();
  }

  reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.addToUndo(this.ogPath);
    this.img.src = this.ogPath;
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.img.src = this.undoStack[this.undoStack.length - 2];
      this.redoStack.unshift(this.undoStack.pop());
    }
  }

  redo() {
    if (this.redoStack.length >= 1) {
      this.img.src = this.redoStack[0];
      this.undoStack.push(this.redoStack.shift());
    }
  }

  setBlur(amount, topLeft = {}, bottomRight = {}) {
    const _topLeft = {
      x: topLeft.x ? topLeft.x : 0,
      y: topLeft.y ? topLeft.y : 0
    };
    const _bottomRight = {
      x: bottomRight.x ? bottomRight.x : this.newWidth,
      y: bottomRight.y ? bottomRight.y : this.newHeight
    };
    const w = Math.abs(_bottomRight.x - _topLeft.x);
    const h = Math.abs(_bottomRight.y - _topLeft.y);
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(this.img, 0, 0, this.newWidth, this.newHeight);
    if (amount >= 1) {
      this._stackBlurCanvasRGBA(amount, _topLeft, w, h);
    } else {
      this.img.src = this.img.src;
    }
  }

  _stackBlurCanvasRGBA(amount, topLeft, width, height) {
    if (isNaN(amount || amount < 1)) {
      return;
    }
    amount |= 0;

    const imageData = this.ctx.getImageData(topLeft.x, topLeft.y, width, height);
    const pixels = imageData.data;

    let x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
        r_out_sum, g_out_sum, b_out_sum, a_out_sum,
        r_in_sum, g_in_sum, b_in_sum, a_in_sum,
        pr, pg, pb, pa, rbs;

    const div = amount + amount + 1;
    const widthMinus1 = width - 1;
    const heightMinus1 = height - 1;
    const radiusPlus1 = amount + 1;
    const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

    const stackStart = new BlurStack();
    let stackEnd;
    let stack = stackStart;
    for (i = 1; i < div; i++) {
      stack = stack.next = new BlurStack();
      if (i == radiusPlus1) {
        stackEnd = stack;
      }
    }
    stack.next = stackStart;
    let stackIn = null;
    let stackOut = null;

    yw = yi = 0;

    const mul_sum = mul_table[amount];
    const shg_sum = shg_table[amount];

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
        r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
        a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;

        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        a_in_sum += pa;

        stack = stack.next;
      }

      stackIn = stackStart;
      stackOut = stackEnd;
      for (x = 0; x < width; x++) {
        pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
        if (pa != 0) {
          pa = 255 / pa;
          pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
          pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
          pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
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

        p = (yw + ((p = x + amount + 1) < widthMinus1 ? p : widthMinus1)) << 2;

        r_in_sum += (stackIn.r = pixels[p]);
        g_in_sum += (stackIn.g = pixels[p + 1]);
        b_in_sum += (stackIn.b = pixels[p + 2]);
        a_in_sum += (stackIn.a = pixels[p + 3]);

        r_sum += r_in_sum;
        g_sum += g_in_sum;
        b_sum += b_in_sum;
        a_sum += a_in_sum;

        stackIn = stackIn.next;

        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        a_out_sum += (pa = stackOut.a);

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
        yi = (yp + x) << 2;
        r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
        a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;

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
        pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
        if (pa > 0) {
          pa = 255 / pa;
          pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
          pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
          pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
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

        p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

        r_sum += (r_in_sum += (stackIn.r = pixels[p]));
        g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
        b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
        a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));

        stackIn = stackIn.next;

        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        a_out_sum += (pa = stackOut.a);

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
}

export default ImageEditor;