import { IPicGo, IImgInfo } from 'picgo/dist/src/types'

export default class Uploader {
  async handle(ctx: IPicGo) {
    const config:IVikaConfig = ctx.getConfig('picBed.vika')

    if(config.insertMode == 1){
      await this.uploadAttachmentsToEachRecord(ctx, config)
    }else if(config.insertMode == 2){
      await this.uploadAttachmentsToSingleRecord(ctx, config)
    }
    
    return ctx
  }

  /**
   * 多张图片占用一个单元格, 插入到同一条新记录中
   */
  uploadAttachmentsToSingleRecord = async (ctx: IPicGo, config: IVikaConfig) => {
    let attachments = []

    for (let i in ctx.input) {
      const startTime = new Date().getTime()
      const uploadResult = await this.uploadAttachment(ctx, ctx.output[i], config)

      if (!uploadResult.success) {
        ctx.emit('notification', {
          title: '图片上传失败',
          body: uploadResult.message
        })
        break;
      } else {
        const attachment = uploadResult.data
        attachments.push(attachment)
        ctx.output[i].url = attachment.url
        ctx.output[i].imgUrl = attachment.url
        ctx.output[i].fileName = attachment.name
      }
      
      const endTime = new Date().getTime();
      if((endTime - startTime)<1000){
        await this.delay(1000)
      }
    }

    const result = await this.addAttachmentsToSingleRecord(ctx, attachments, config)

    if (!result.success) {
      ctx.emit('notification', {
        title: '上传失败',
        body: result.message
      })
    }
  }

  /**
   * 一张图片插入一条新记录
   */
   uploadAttachmentsToEachRecord = async (ctx: IPicGo, config: IVikaConfig) => {
    let attachments = []

    for (let i in ctx.input) {
      const startTime = new Date().getTime()
      const uploadResult = await this.uploadAttachment(ctx, ctx.output[i], config)

      if (!uploadResult.success) {
        ctx.emit('notification', {
          title: '图片上传失败',
          body: uploadResult.message
        })
        break;
      }

      const attachment = uploadResult.data
      attachments.push(attachment)
      ctx.output[i].url = attachment.url
      ctx.output[i].imgUrl = attachment.url
      ctx.output[i].fileName = attachment.name

      const postData = {
        "records": [{
          "fields": {
            [config.attachmentFieldName]: [attachment]
          }
        }],
        "fieldKey": "name"
      }
      const result = await this.insertRecord(ctx, config, postData)

      if (!result.success) {
        ctx.emit('notification', {
          title: '上传失败',
          body: result.message
        })
        break;
      }

      const endTime = new Date().getTime();
      if((endTime - startTime)<1000){
        await this.delay(1000)
      }

    }

  }

  delay = async (duration:number) => {
    return new Promise(resolve => setTimeout(resolve, duration))
  }

  /**
   * 调用维格表“附件上传”接口，将本地文件以 buffer 形式上传
   */
  uploadAttachment = async (ctx: IPicGo, localFile:IImgInfo, config:IVikaConfig):Promise<IVikaAttachmentUploadResult> => {
    let formData = {
      file: {
        value:  localFile.buffer,
        options: {
          filename: localFile.fileName
        }
      }
    }
    
    return ctx.request({
      method: "POST",
      uri: `https://api.vika.cn/fusion/v1/datasheets/${config.datasheetId}/attachments`,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`
      },
      formData: formData,
      json: true
    })
  }

  /**
   * 调用维格表“创建记录”接口，将所有附件放到同一个字段里并创建新记录
   */
  addAttachmentsToSingleRecord = async (ctx: IPicGo, attachments: IVikaAttachment[], config:IVikaConfig):Promise<IVikaApiNormalResult> => {
    //ctx.log.info( JSON.stringify({attachments, config}, null, 4) )

    let postData = {
      "records": [{
        "fields": {
          [config.attachmentFieldName]: attachments
        }
      }],
      "fieldKey": "name"
    }

    return this.insertRecord(ctx, config, postData)
  }

  insertRecord = async (ctx: IPicGo,  config:IVikaConfig, postData: any) => {
    return ctx.request({
      method: "POST",
      uri: `https://api.vika.cn/fusion/v1/datasheets/${config.datasheetId}/records`,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      json: true,
      body: postData
    })
  }

}