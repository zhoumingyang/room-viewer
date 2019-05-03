/**
 * covert canvas to image
 * and save the image file
 */

export const Canvas2Image = function () {

    // check if support sth.
    const $support = function (): any {
        const canvas: any = document.createElement('canvas');
        const ctx: any = canvas.getContext('2d');
        return {
            canvas: !!ctx,
            imageData: !!ctx.getImageData,
            dataURL: !!canvas.toDataURL,
            btoa: !!window.btoa
        };
    }();

    const downloadMime: string = 'image/octet-stream';
    function scaleCanvas(canvas: any, width: number, height: number): any {
        const w: number = canvas.width;
        const h: number = canvas.height;
        if (width == undefined) {
            width = w;
        }
        if (height == undefined) {
            height = h;
        }

        const retCanvas: any = document.createElement('canvas');
        const retCtx: any = retCanvas.getContext('2d');
        retCanvas.width = width;
        retCanvas.height = height;
        retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
        return retCanvas;
    }

    function getDataURL(canvas: any, type: string, width: number, height: number): any {
        canvas = scaleCanvas(canvas, width, height);
        return canvas.toDataURL(type);
    }

    function saveFile(strData: string) {
        document.location.href = strData;
    }

    function genImage(strData: string): any {
        const img: any = document.createElement('img');
        img.src = strData;
        return img;
    }

    function fixType(type: string): string {
        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
        const r: string = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }

    function encodeData(data: any): any {
        if (!window.btoa) { throw 'btoa undefined' }
        let str = '';
        if (typeof data == 'string') {
            str = data;
        } else {
            for (let i = 0; i < data.length; i++) {
                str += String.fromCharCode(data[i]);
            }
        }

        return btoa(str);
    }

    function getImageData(canvas: any): any {
        const w: number = canvas.width;
        const h: number = canvas.height;
        return canvas.getContext('2d').getImageData(0, 0, w, h);
    }

    function makeURI(strData: string, type: string): string {
        return 'data:' + type + ';base64,' + strData;
    }


	/**
	 * create bitmap image
	 * 按照规则生成图片响应头和响应体
	 */
    const genBitmapImage = function (oData: any): any {

        //
        // BITMAPFILEHEADER: http://msdn.microsoft.com/en-us/library/windows/desktop/dd183374(v=vs.85).aspx
        // BITMAPINFOHEADER: http://msdn.microsoft.com/en-us/library/dd183376.aspx
        //

        let biWidth: number = oData.width;
        let biHeight: number = oData.height;
        let biSizeImage: number = biWidth * biHeight * 3;
        let bfSize: number = biSizeImage + 54; // total header size = 54 bytes

        //
        //  typedef struct tagBITMAPFILEHEADER {
        //  	WORD bfType;
        //  	DWORD bfSize;
        //  	WORD bfReserved1;
        //  	WORD bfReserved2;
        //  	DWORD bfOffBits;
        //  } BITMAPFILEHEADER;
        //
        const BITMAPFILEHEADER: Array<number> = [
            // WORD bfType -- The file type signature; must be "BM"
            0x42, 0x4D,
            // DWORD bfSize -- The size, in bytes, of the bitmap file
            bfSize & 0xff, bfSize >> 8 & 0xff, bfSize >> 16 & 0xff, bfSize >> 24 & 0xff,
            // WORD bfReserved1 -- Reserved; must be zero
            0, 0,
            // WORD bfReserved2 -- Reserved; must be zero
            0, 0,
            // DWORD bfOffBits -- The offset, in bytes, from the beginning of the BITMAPFILEHEADER structure to the bitmap bits.
            54, 0, 0, 0
        ];

        //
        //  typedef struct tagBITMAPINFOHEADER {
        //  	DWORD biSize;
        //  	LONG  biWidth;
        //  	LONG  biHeight;
        //  	WORD  biPlanes;
        //  	WORD  biBitCount;
        //  	DWORD biCompression;
        //  	DWORD biSizeImage;
        //  	LONG  biXPelsPerMeter;
        //  	LONG  biYPelsPerMeter;
        //  	DWORD biClrUsed;
        //  	DWORD biClrImportant;
        //  } BITMAPINFOHEADER, *PBITMAPINFOHEADER;
        //
        const BITMAPINFOHEADER: Array<number> = [
            // DWORD biSize -- The number of bytes required by the structure
            40, 0, 0, 0,
            // LONG biWidth -- The width of the bitmap, in pixels
            biWidth & 0xff, biWidth >> 8 & 0xff, biWidth >> 16 & 0xff, biWidth >> 24 & 0xff,
            // LONG biHeight -- The height of the bitmap, in pixels
            biHeight & 0xff, biHeight >> 8 & 0xff, biHeight >> 16 & 0xff, biHeight >> 24 & 0xff,
            // WORD biPlanes -- The number of planes for the target device. This value must be set to 1
            1, 0,
            // WORD biBitCount -- The number of bits-per-pixel, 24 bits-per-pixel -- the bitmap
            // has a maximum of 2^24 colors (16777216, Truecolor)
            24, 0,
            // DWORD biCompression -- The type of compression, BI_RGB (code 0) -- uncompressed
            0, 0, 0, 0,
            // DWORD biSizeImage -- The size, in bytes, of the image. This may be set to zero for BI_RGB bitmaps
            biSizeImage & 0xff, biSizeImage >> 8 & 0xff, biSizeImage >> 16 & 0xff, biSizeImage >> 24 & 0xff,
            // LONG biXPelsPerMeter, unused
            0, 0, 0, 0,
            // LONG biYPelsPerMeter, unused
            0, 0, 0, 0,
            // DWORD biClrUsed, the number of color indexes of palette, unused
            0, 0, 0, 0,
            // DWORD biClrImportant, unused
            0, 0, 0, 0
        ];

        let iPadding: number = (4 - ((biWidth * 3) % 4)) % 4;

        let aImgData: any = oData.data;

        let strPixelData: string = '';
        let biWidth4: number = biWidth << 2;
        let y: number = biHeight;
        let fromCharCode = String.fromCharCode;

        do {
            let iOffsetY: number = biWidth4 * (y - 1);
            let strPixelRow: string = '';
            for (let x = 0; x < biWidth; x++) {
                let iOffsetX = x << 2;
                strPixelRow += fromCharCode(aImgData[iOffsetY + iOffsetX + 2]) +
                    fromCharCode(aImgData[iOffsetY + iOffsetX + 1]) +
                    fromCharCode(aImgData[iOffsetY + iOffsetX]);
            }

            for (let c = 0; c < iPadding; c++) {
                strPixelRow += String.fromCharCode(0);
            }

            strPixelData += strPixelRow;
        } while (--y);

        let strEncoded = encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) + encodeData(strPixelData);

        return strEncoded;
    };

	/**
	 * saveAsImage
	 * @param canvasElement
	 * @param {String} image type
	 * @param {Number} [optional] png width
	 * @param {Number} [optional] png height
	 */
    var saveAsImage = function (canvas: any, width: number, height: number, type: string) {
        if ($support.canvas && $support.dataURL) {
            if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
            if (type == undefined) { type = 'png'; }
            type = fixType(type);
            if (/bmp/.test(type)) {
                var data = getImageData(scaleCanvas(canvas, width, height));
                var strData = genBitmapImage(data);
                saveFile(makeURI(strData, downloadMime));
            } else {
                var strData = getDataURL(canvas, type, width, height);
                saveFile(strData.replace(type, downloadMime));
            }
        }
    };

    var convertToImage = function (canvas: any, width: number, height: number, type: string) {
        if ($support.canvas && $support.dataURL) {
            if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
            if (type == undefined) { type = 'png'; }
            type = fixType(type);

            if (/bmp/.test(type)) {
                var data = getImageData(scaleCanvas(canvas, width, height));
                var strData = genBitmapImage(data);
                return genImage(makeURI(strData, 'image/bmp'));
            } else {
                var strData = getDataURL(canvas, type, width, height);
                return genImage(strData);
            }
        }
    };



    return {
        saveAsImage: saveAsImage,
        saveAsPNG: function (canvas: any, width: number, height: number): any {
            return saveAsImage(canvas, width, height, 'png');
        },
        saveAsJPEG: function (canvas: any, width: number, height: number): any {
            return saveAsImage(canvas, width, height, 'jpeg');
        },
        saveAsGIF: function (canvas: any, width: number, height: number): any {
            return saveAsImage(canvas, width, height, 'gif');
        },
        saveAsBMP: function (canvas: any, width: number, height: number): any {
            return saveAsImage(canvas, width, height, 'bmp');
        },

        convertToImage: convertToImage,
        convertToPNG: function (canvas: any, width: number, height: number): any {
            return convertToImage(canvas, width, height, 'png');
        },
        convertToJPEG: function (canvas: any, width: number, height: number): any {
            return convertToImage(canvas, width, height, 'jpeg');
        },
        convertToGIF: function (canvas: any, width: number, height: number): any {
            return convertToImage(canvas, width, height, 'gif');
        },
        convertToBMP: function (canvas: any, width: number, height: number): any {
            return convertToImage(canvas, width, height, 'bmp');
        }
    };

}();
