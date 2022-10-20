const picgo = require('picgo')
import Uploader from './uploader'


const uploader = new Uploader()


export = (ctx: typeof picgo) => {
  const config = () => {
    let userConfig:IVikaConfig = ctx.getConfig('picBed.vika')

    return [
      {
        name: 'apiToken',
        type: 'password',
        default: "",
        required: true,
        message: '请输入你的维格表API token',
        alias: 'API Token'
      },
      {
        name: 'datasheetId',
        type: 'input',
        default: "",
        required: true,
        message: '请填写要保存的维格表ID',
        alias: '维格表ID'
      },
      {
        name: 'attachmentFieldName',
        type: 'input',
        default: "附件",
        required: true,
        message: '请填写图片要存储的字段名称',
        alias: '字段名称'
      },
      {
        name: 'insertMode',
        type: 'list',
        choices: [
          {
            name: "一张图片占用一个单元格",
            value: 1
          },
          {
            name: "多张图片占用一个单元格",
            value: 2
          }
        ],
        default: 1,
        required: true,
        message: '请选择图片上传方式',
        alias: '图片上传方式'
      }
    ]
  }

  const register = () => {
    ctx.helper.uploader.register('vika', {
      async handle (ctx) {
        //ctx.log.info( "uploader:" + JSON.stringify(ctx.output, null, 4) )
        await uploader.handle(ctx)
        return ctx
      },
      name: 'vika维格表',
      config: config
    })

    // ctx.helper.transformer.register('vika', {
    //   handle (ctx) {
    //     ctx.log.info( "transformer:" + JSON.stringify(ctx.output, null, 4) )
    //   }
    // })

    ctx.helper.beforeTransformPlugins.register('vika', {
      handle (ctx) {
        //ctx.log.info( "beforeTransformPlugins:" + JSON.stringify(ctx.input, null, 4) )
      }
    })

    ctx.helper.beforeUploadPlugins.register('vika', {
      handle (ctx) {
        //ctx.log.info( "beforeTransformPlugins:" + JSON.stringify(ctx.input, null, 4) )
        //const imageList = ctx.i
      }
    })

    ctx.helper.afterUploadPlugins.register('vika', {
      handle (ctx) {
        console.log(ctx)
      }
    })
  }
  return {
    uploader: 'vika',
    //transformer: 'vika',
    register
  }
}