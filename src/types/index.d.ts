interface IVikaConfig {
    // 维格表API Token
    apiToken: string
    // 图片上传方式, 1:一张图片占用一个单元格; 2:本次上传图片占用一个单元格
    insertMode: 1 | 2
    // 维格表ID
    datasheetId: string,
    // 附件字段的名称
    attachmentFieldName: string
}

/**
 * 详细说明，请看官方说明
 * https://vika.cn/developers/api/reference#operation/upload-attachments
 */
interface IVikaAttachment {
    token: string,
    name: string,
    size: number,
    width: number,
    height: number,
    mimeType: string,
    preview?: string,
    url: string
}

interface IVikaAttachmentUploadResult {
    code: number,
    success: boolean,
    message: string,
    data: IVikaAttachment
}

interface IVikaApiNormalResult {
    code: number,
    success: boolean,
    message: string,
    data: any
}