// import React from 'react';
// import {
//   Alert,
//   Breadcrumb,
//   Button,
//   Icon,
//   message,
//   Spin,
//   Steps,
//   Upload
// } from 'antd';
// import ObsClient from '../esdk-obs-browserjs';
// import { createBrowserHistory } from 'history'
// const history = createBrowserHistory();

// const Dragger = Upload.Dragger;
// const Step = Steps.Step;
// let limitMessage = true;

// const steps = [
//   {
//     title: '上传图片',
//     content: 'Second-content'
//   },
//   {
//     title: '完成',
//     content: 'Third-content'
//   }
// ];

// /**
//  * 导入
//  * @returns {Promise<IAsyncResult<T>>}
//  */
// const imporImgtGoods = (imgList) => {
//   return fetch('/upload', {
//     method: 'POST',
//     body: JSON.stringify(imgList)
//   });
// };

// /**
//  * 获取obs参数
//  * @returns {Promise<IAsyncResult<T>>}
//  */
// const getObsMessage = () => {
//   return fetch('/get/obs/config');
// };

// export default class GoodsImgImport {
//   constructor(props) {
//     super(props);
//     this.state = {
//       current: 0,
//       loading: false,
//       isImport: true,
//       fileList: [],
//       imgList: [],
//       accessKeyId: '',
//       accessKeySecret: '',
//       bucketName: '',
//       endPoint: ''
//     };
//   }
//   componentWillMount() {
//     this.getObsMessage();
//   }
//   next() {
//     const current = this.state.current + 1;
//     this.setState({ current });
//   }
//   prev() {
//     const current = this.state.current - 1;
//     this.setState({ current });
//   }

//   render() {
//     const { current, isImport } = this.state;
//     return (
//       <div>
//         <Breadcrumb>
//           <Breadcrumb.Item>商品图片上传</Breadcrumb.Item>
//         </Breadcrumb>
//         <div className="container">
//           <h3>商品图片上传</h3>
//           <Alert
//             message="操作说明："
//             description={
//               <ul>
//                 <li>1、商品主图命名规则：sku编号_main_xx</li>
//                 <li>2、商品详情图命名规则：sku编号_detail_xx</li>
//                 <li>
//                   3、请先按照规则中的要求填写图片名称数据，未按要求填写将会导致商品图片同步失败。
//                 </li>
//                 <li>
//                   4、请选择.jpg .jpeg
//                   .png或.gif文件，文件大小≤20M，建议每次上传不超过200个商品图片。
//                 </li>
//               </ul>
//             }
//           />

//           <div style={styles.uploadTit}>
//             <Steps current={current}>
//               {steps.map((item) => (
//                 <Step key={item.title} title={item.title} />
//               ))}
//             </Steps>
//           </div>

//           {current == 0 ? (
//             <Spin
//               spinning={this.state.loading}
//               tip="数据处理中，请耐心等待....."
//             >
//               <div className="steps-content" style={styles.center}>
//                 <Dragger
//                   onChange={this.changeImage}
//                   fileList={this.state.fileList}
//                   name="file"
//                   beforeUpload={this.beforeUpload}
//                   multiple={true} // 默认多选
//                   customRequest={this.upload} // 使用antd upload 重新定义上传方法
//                   accept=".jpg,.jpeg,.png,.gif"
//                   showUploadList={{
//                     showPreviewIcon: false,
//                     showDownloadIcon: false
//                   }}
//                   onRemove={(file) => {
//                     const uid = file.uid;
//                     let fileList = this.state.fileList.filter(
//                       (f) => f.uid != uid
//                     );
//                     let imgList = this.state.imgList.filter(
//                       (f) => f.uid != uid
//                     );
//                     this.setState({ fileList: fileList, imgList: imgList });
//                   }}
//                 >
//                   <div style={styles.content}>
//                     <p
//                       className="ant-upload-hint"
//                       style={{ fontSize: 14, color: 'black' }}
//                     >
//                       <Icon
//                         type="inbox"
//                         style={{ color: '#ff9147', fontSize: '48px' }}
//                       />
//                       <br />
//                       <span>选择图片上传（点击或拖拽图片以上传）</span>
//                       <br />
//                       <span>支持一张或多张图片上传</span>
//                     </p>
//                   </div>
//                 </Dragger>

//                 <p style={styles.grey}>
//                   请选择.jpg .jpeg
//                   .png或.gif文件格式，文件大小≤20M，建议每次导入不超过200个商品图片。
//                 </p>

//                 <Button
//                   type="primary"
//                   onClick={this.confirmImport}
//                   disabled={isImport}
//                 >
//                   确认导入
//                 </Button>
//               </div>
//             </Spin>
//           ) : null}
//           {current == 1 ? (
//             <div className="steps-content" style={styles.center}>
//               <div style={styles.center}>
//                 <p style={styles.greyBig}>
//                   上传成功，同步任务已生成，请耐心等待任务结束！
//                 </p>
//                 <p style={styles.grey1}>
//                   您可以前往商品列表查看已上传的商品图片，或是继续导入。
//                 </p>
//               </div>

//               <Button type="primary" onClick={this._init}>
//                 继续导入
//               </Button>
//               <Button
//                 style={{ marginLeft: 20 }}
//                 type="primary"
//                 onClick={this._viewProgress}
//               >
//                 前往商品列表
//               </Button>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     );
//   }
//   _viewProgress = () => {
//     //跳转到商品列表
//     history.push({
//       pathname: '/goods-list'
//     });
//   };

//   _init = () => {
//     let loading = false;
//     let isImport = true;
//     this.setState({
//       loading,
//       isImport
//     });
//     this.prev();
//   };

//   _next = () => {
//     this.next();
//   };

//   confirmImport = async () => {
//     const { imgList } = this.state;
//     try {
//       let data = [];
//       imgList.forEach((ele) => {
//         data.push(ele.name);
//       });
//       const importRes = await imporImgtGoods(data);
//       //成功状态
//       if (importRes.res.code =='0000') {
//         this.next();
//       } else {
//         message.error(importRes.res.message);
//       }
//     } catch (error) {
//       message.error('网络异常');
//     }
//   };

//   changeImage = (info) => {
//     // console.log(info, 'info');
//     let fileList = info.fileList;
//     const status = info.file.status;
//     let loading = true;
//     if (status == 'uploading') {
//       this.setState({ loading, fileList: [...fileList] });
//     }
//     if (status === 'done') {
//       let isImport = false;
//       let fileName = '';
//       fileName = info.file.name;
//       loading = false;
//       message.success(fileName + '上传成功');
//       this.setState({
//         loading,
//         fileList: [...fileList],
//         isImport
//       });
//     } else if (status === 'error') {
//       message.error('上传失败');
//       loading = false;
//       this.setState({ loading, fileList: [...fileList] });
//     }
//   };
//   // 上传前的检验,指定上传类型，判断大小等
//   beforeUpload = async (file, fileList) => {
//     let fileName = file.name.toLowerCase();
//     // console.log(fileName, fileList, fileList.length);
//     if (fileList.length > 200) {
//       return new Promise((resolve, reject) => {
//         if (limitMessage) {
//           message.error('建议每次上传不超过200个商品图片');
//           limitMessage = false;
//           setTimeout(() => {
//             limitMessage = true;
//           }, 1000);
//         }
//         return reject(false);
//       });
//     }
//     let index = fileName.indexOf('_');
//     let fileNameNull = fileName.substring(0, index);
//     if (
//       fileName.indexOf('_main_') != -1 ||
//       fileName.indexOf('_detail_') != -1
//     ) {
//       if (fileNameNull) {
//         return new Promise((resolve, reject) => {
//           if (file?.size > 20 * 1024 * 1024) {
//             message.error('请上传20M以内的文件');
//             return reject(false);
//           }

//           return resolve(true);
//         });
//       } else {
//         return new Promise((resolve, reject) => {
//           message.error(fileName + '不符合上传规则');
//           return reject(false);
//         });
//       }
//     } else {
//       return new Promise((resolve, reject) => {
//         message.error(fileName + '不符合上传规则');
//         return reject(false);
//       });
//     }
//   };

//   // 重点-上传方法
//   upload = (data) => {
//     let that = this;
//     //配置里面获取
//     const obsClient = new ObsClient({
//       access_key_id: this.state.accessKeyId,
//       secret_access_key: this.state.accessKeySecret,
//       server: this.state.endPoint
//     });
//     // 设置表单参数
//     var formParams = {
//       // 设置对象访问权限为公共读
//       'x-obs-acl': obsClient.enums.AclPublicRead,
//       // 设置对象MIME类型
//       'content-type': 'text/plain'
//     };
//     // 设置表单上传请求有效期，单位：秒
//     var expires = 3600;
//     var res = obsClient.createPostSignatureSync({
//       Expires: expires,
//       FormParams: formParams
//     });

//     obsClient.putObject(
//       {
//         Bucket: this.state.bucketName, // 桶名称
//         Key: `temp/${data.file.name}`, // 桶内对象文件存储地址 文件夹名称+上传文件名
//         SourceFile: data.file,
//         Policy: res.Policy, // 策略
//         Signature: res.Signature, //签名
//         expires
//       },
//       function(err, result) {
//         if (err) {
//           //此处上传失败后 可以调 data.onError方法报错
//           console.log('Error-->' + err);
//           data.onError();
//         } else {
//           //此处上传成功后 可以调 data.onSuccess更改文件上传对象的状态
//           console.log('Status-->', result);
//           if (result.CommonMsg.Status == 200) {
//             let imgList = that.state.imgList;
//             let message = {
//               uid: data.file.uid,
//               name: `temp/${data.file.name}`
//             };
//             imgList.push(message);
//             that.setState({ imgList: imgList });
//             data.onSuccess();
//           }
//         }
//       }
//     );
//   };
//   //获取obs参数
//   getObsMessage = async () => {
//     try {
//       const obsMessage = await getObsMessage();
//       // console.log(obsMessage, 'obsMessage');
//       if (obsMessage.res.code == "0000") {
//         this.setState({
//           accessKeyId: obsMessage.res.context.accessKeyId,
//           accessKeySecret: obsMessage.res.context.accessKeySecret,
//           endPoint: 'https://' + obsMessage.res.context.endPoint,
//           bucketName: obsMessage.res.context.bucketName
//         });
//       } else {
//         message.error(obsMessage.res.message);
//       }
//     } catch (error) {
//       message.error('网络异常');
//     }
//   };
// }

// const styles = {
//   uploadTit: {
//     margin: '40px 200px'
//   },
//   content: {
//     background: '#fcfcfc',
//     padding: '30px 0'
//   },
//   grey: {
//     color: '#999999',
//     marginTop: 10,
//     marginBottom: 10,
//     marginLeft: 10
//   },
//   tip: {
//     marginTop: 10,
//     marginLeft: 10,
//     color: '#333'
//   },
//   error: {
//     color: '#e10000'
//   },
//   grey1: {
//     color: '#666666',
//     marginTop: 20,
//     marginBottom: 10,
//     marginLeft: 10
//   },
//   center: {
//     textAlign: 'center',
//     width: '800px',
//     margin: '0 auto'
//   },
//   greyBig: {
//     color: '#333333',
//     fontSize: 16,
//     fontWeight: 'bold'
//   }
// };


