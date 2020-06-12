export class FileExt {
    pdfExt(ext: string) {
        const extenstion = ext.slice(-3);
        if (extenstion === 'pdf') {
            return true;
        } else {
            return false;
        }
    };
    mp3Ext(ext: string) {
        const extenstion = ext.slice(-3);
        if (extenstion === 'mp3') {
            return true;
        } else {
            return false;
        }
    };
    mp4Ext(ext: string) {
        const extenstion = ext.slice(-3);
        if (extenstion === 'mp4') {
            return true;
        } else {
            return false;
        }
    };
    wordExt(ext: string) {
        const extenstion = ext.slice(-3);
        if ((extenstion === 'doc' ) || (extenstion === 'ord' )
            || (extenstion === 'ent' )) {
            return true;
        } else {
            return false;
        }
    };
    ExcelExt(ext: string) {
        const extenstion = ext.slice(-3);
        if ((extenstion === 'xls' ) || (extenstion === 'eet' ) || (extenstion === 'csv' )) {
            return true;
        } else {
            return false;
        }
    };
    ImgExt(ext: string) {
        const extenstion = ext.slice(-3);
        if ((extenstion === 'png' ) || (extenstion === 'peg' )
        || (extenstion === 'gif' )  || (extenstion === 'xml')) {
            return true;
        } else {
            return false;
        }
    };
    
    PptExt(ext: string) {
        const extenstion = ext.slice(-3);
        if ((extenstion === 'ppt' ) || (extenstion === 'ptx' ) || (extenstion === 'ion' )) {
            return true;
        } else {
            return false;
        }
    };
    isDoc(ext: string) {
        if(this.wordExt(ext) || this.ExcelExt(ext) || this.PptExt(ext)) {
            return true;
        } else {
            return false;
        }
    }
    getIcon(ext: string) {
        if(this.pdfExt(ext)) {
            return 'fa fa-file-pdf text-danger'
        }else if(this.ImgExt(ext)) {
            return 'fa fa-file-image text-info'
        }else if(this.wordExt(ext)) {
            return 'fa fa-file-word text-primary'
        }else if(this.ExcelExt(ext)) {
            return 'fa fa-file-excel text-success'
        }else if(this.PptExt(ext)) {
            return 'fa fa-file-powerpoint text-danger'
        } else {
            return 'fa fa-file-alt text-secondary'
        }
    }
    
}
export default FileExt