'use strict';

const Base = require('./Base');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

class File extends Base {
    constructor(client, filePath) {
        super(client);

        this.filePath = filePath;
        this.inputId = this.getRandomId();
        this.mimetype = mime.getType(filePath);
        this.filename = path.basename(filePath);
        this.filesize = fs.statSync(filePath).size;
    }

    getRandomId() {
        return `file-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    async create() {
        await this.client.pupPage?.evaluate((fileId) => {
            let input = document.getElementById(fileId);
            if (!input) {
                input = document.createElement('input');
                input.type = 'file';
                input.style.display = 'none';
                input.id = fileId;
                document.body.appendChild(input);
            }
        }, this.inputId);
        const inputElement = await this.client.pupPage?.$(`#${this.inputId}`);
        await inputElement?.uploadFile(this.filePath);
    }

    async remove() {
        await this.client.pupPage?.evaluate((fileId) => {
            const input = document.getElementById(fileId);
            if (input) input.remove();
        }, this.inputId);
    }
}

module.exports = File;
