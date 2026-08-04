window.FX_HOMEWORK_REVIEW = {
  title: '作业 · 我的文件',
  source: { label: '查看石墨产品稿与评论', url: 'https://shimo.zhenguanyu.com/docs/30dyDb9LGwZXfJ1K' },
  reviewVersions: [
    {
      id: 'v1.0', label: 'v1.0 文件管理与发布', default: true,
      items: [
        { anchorId: 'file-list', title: '文件夹视图与操作入口', purpose: '确认文件夹层级、文件预览入口，以及上传、管理和发布记录入口。' },
        { anchorId: 'upload-dialog', title: '上传文件与格式限制', purpose: '确认文件上传与墨水屏发布分别校验格式，并确认 100MB / 300MB 的大小限制说明。' },
        { anchorId: 'publish-dialog', title: '发布到墨水屏', purpose: '确认学科和接收学生为必填项，且文件可多次发布。' },
        { anchorId: 'student-picker', title: '选择学生', purpose: '确认按班级或指定学生选择接收对象的交互。' },
        { anchorId: 'publish-records', title: '发布记录与删除同步', purpose: '确认整班显示班级、指定发送显示学生，删除后学生设备同步移除文件。' },
        { anchorId: 'file-preview', title: '文件预览与下载', purpose: '确认预览页仅提供原文件预览、发布到墨水屏和下载。' }
      ]
    }
  ]
};
