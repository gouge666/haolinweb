import type { Route } from "./+types/home";
import { Component, useEffect, useState, type Key } from "react";
import { Image,Button, Cascader, DatePicker, Input, InputNumber, message, Modal, Space, Table, Tag, TimePicker, Upload } from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ObsClient from "./esdk-obs-browserjs/index.js"

import "./home.css"
import yunzou from "../img/yunzou.png"
import yunlai from "../img/yunlai.png"
import shangjia from "../img/shangjia.png"
import gujia from "../img/gujia.png"
import guanli from "../img/guanli.png"
import jixiao from "../img/jixiao.png"

const {PreviewGroup} = Image

// const url = "/api"
const url = "http://115.29.176.26:9950/"
// const url = "http://127.0.0.1:9950/"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "好邻管家" },
    { name: "description", content: "Welcome to 好邻管家!" },
  ];
}
const { RangePicker } = DatePicker;

export default function Home() {
  const [loginType,setLoginType] = useState("phone")

  const [page, setPage] = useState("loginPage");
  // const [page, setPage] = useState("zhanzhangPage");
  // const [page, setPage] = useState("cangkuPage");
  // 用户信息
  const [userInfo,setUserInfo] = useState<any>({
    token: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NDU5MDk5NzksImlzcyI6ImRldGVjdCIsInN1YiI6IntcInBob25lXCI6XCIxNTgyMzAxOTAyNlwiLFwiaWRcIjoyNCxcInVzZXJuYW1lXCI6XCJnb3Vza1wifSIsImV4cCI6MTc0NTk5NjM3OX0._vqkp8onDKNqvxJN2VCfpA-RQSAMYAgbu1Yr8_D9BO_bQ69UQACds8DNFJY35LWAcLUKaSnsYbxIxvDmRH12xQ"
  })
  // 登录相关状态============================================================
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [getVerifyCodeColdTime, setGetVerifyCodeColdTime] = useState(0);
  const [isLogining, setIsLogining] = useState(false);

  // 处理手机号输入（双向绑定核心）[1,3](@ref)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value); // 使用 e.target.value 获取输入值
  };

  // 处理验证码输入（双向绑定核心）[1,3](@ref)
  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyCode(e.target.value); // 使用 e.target.value 获取输入值
  };

  // 获取验证码（补充倒计时逻辑）[5](@ref)
  const handleGetVerifyCode = async () => {
    if (getVerifyCodeColdTime > 0) return; // 防止重复点击

    const reg = /^1[3-9]\d{9}$/;
    if(!reg.test(String(phone).trim())){
      alert("请输入正确格式的手机号")
      return;
    }

    setGetVerifyCodeColdTime(60);
    const timer = setInterval(() => {
      setGetVerifyCodeColdTime((prev) => {
        if (prev === 1) clearInterval(timer);
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    // 发送后端请求
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append("phone", phone);

    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}user/verify_code`, {
        method: "POST",
        body: formData // FormData 类型会自动设置 multipart/form-data
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("验证码请求错误:", error);
      throw error; // 向上传递错误
    }

    
  };

  // 登录逻辑
  const handleLogin = async () => {
    if(isLogining) return;

    // 这里添加实际登录逻辑
    // 防抖
    let response:any = null

    if(loginType=='phone'){
      // 校验手机号
      const reg = /^1[3-9]\d{9}$/;
      if(!reg.test(String(phone).trim())){
        alert("请输入正确格式的手机号")
        return;
      }
      // 校验验证码
      if(verifyCode.length === 0){
        alert("请输入验证码")
        return;
      }

      // 设置isLogining为true
      setIsLogining(true);

      
      // 根据登录结果分支做对应逻辑处理
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const data = {
        phone: phone,
        code: verifyCode
      }
      response = await fetch(`${url}user/login_by_code`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });
    

      
    }else{
        // 校验用户名
        if(username.trim().length==0){
          alert("请输入用户名")
          return;
        }
        // 校验密码
        if(password.trim().length === 0){
          alert("请输入密码")
          return;
        }

        // 设置isLogining为true
        setIsLogining(true);


        // 根据登录结果分支做对应逻辑处理
        // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
        const data = {
          username,
          password
        }
        response = await fetch(`${url}user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(result);
      if(result.message == "验证码错误"){
        alert("验证码错误")
        setIsLogining(false)
        return;
      }else if(result.message == "用户不存在"){
        alert("用户不存在")
        setIsLogining(false)
      }else if(result.success == false){
        alert(result.message)
        setIsLogining(false)
        return
      }
        else {
        // 1.存储用户信息
        setUserInfo(result.data)
        console.log("登录成功，用户信息",result.data)
        // 3是站长，5是管理员
        // 检测用户权限
        if(result.data.role.includes(3)){
          alert("站长登录成功")
          setPage("zhanzhangPage")
          await getCategory()
          assign_task_not_evaluate_list()
        }else if(result.data.role.includes(5)){
          alert("仓库管理员登录成功")
          setPage("cangkuPage")
          cangku()
        }else {
          alert("没有访问权限")
        }
      }
      

    
    
  };


  // 仓库管理员相关=====================================================================
  // 仓库管理员6个接口
  // 仓库管理员查看在途货物
  const goods_from_station_to_warehouse_list_goods_on_the_way = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_from_station_to_warehouse/list_goods_on_the_way`, {
        headers:{
          token: userInfo.token
        },
        method: "GET",
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员查看在途货物",result)
      setOnWayGoodsList(result.data)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 仓库管理员确认收到货物
  const goods_from_station_to_warehouse_confirm_arrive_batch = async(id:any)=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_from_station_to_warehouse/confirm_arrive_batch`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify([id])
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员查看在途货物",result)
      if(result.success){
        message.success("确认成功")
      }else{
        message.error(result.message)
      }
      goods_from_station_to_warehouse_list_goods_on_the_way()
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 仓库管理员查询需要运往驿站的货物列表
  const goods_from_warehouse_to_station_need_transform = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_from_warehouse_to_station/need_transform`, {
        headers:{
          token: userInfo.token
        },
        method: "GET",
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员查询需要运往驿站的货物列表",result)
      setNeedTransformGoodsList(result.data)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 仓库管理员确认货物已从仓库发出
  const goods_from_warehouse_to_station_confirm_depart_batch = async(id:any)=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_from_warehouse_to_station/confirm_depart_batch`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify([id])
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员查看在途货物",result)
      if(result.success){
        message.success("确认成功")
      }else{
        message.error("确认失败")
      }
      goods_from_warehouse_to_station_need_transform()
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  } 
  // 仓库管理员查看待上架的货物列表
  const goods_list = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods/list`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          "categoryId": null,  // 货物的id
          "locationCategory": 2, // 货物所在位置 1. 社区 2. 仓库
          "province": userInfo.province, // locationCategory = 才有
          "city": userInfo.city,
          "district": userInfo.district,
          "community": userInfo.community,
          "location": 0, // locationCategory = 2才有
          "status": 1 // 1未上架 2 售卖中 3 锁定 4 已卖出 5 下架
        })
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员查看待上架的货物列表",result)
      setShangjiaGoodsList(result.data)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  } 
  // 仓库管理员上架货物
  const goods_put_on_sale = async(goodsId: any,categoryId: any,tagName: any,title: any,urls: any,detail: any,depreciationRate: any,price: any,size: any,shippingFee: any)=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods/put_on_sale`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          goodsId,
          categoryId,
          tagName,
          title,
          url: urls,
          detail,
          depreciationRate,
          price,
          size: parseInt(size)+1,
          shippingFee
        })
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员上架货物",result)
      return result
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 仓库管理员直接上架货物
  const goods_zhijie_put_on_sale = async(categoryId: any,tagName: any,title: any,urls: any,detail: any,depreciationRate: any,price: any,size: any,shippingFee: any,comment: any,count: any)=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods/warehouse/direct/put_on_sale`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          categoryId,
          tagName,
          title,
          url: urls,
          detail,
          depreciationRate,
          price,
          size: parseInt(size)+1,
          shippingFee,
          comment,
          count,
          multiFlag: 1
        })
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("仓库管理员上架货物",result)
      return result
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 获取商品一级分类
  const goods_category_map_one = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_category/map/one`, {
        headers:{
          token: userInfo.token
        },
        method: "GET",
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("获取商品一级分类",result)
      return result
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 获取商品二级分类
  const goods_category_map_two = async(id_one: any)=>{
    const formData = new FormData();
    formData.append("pId", id_one);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}goods_category/map/two`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("获取商品二级分类",result)
      return result
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 仓库管理员所需要用到的字段们
  // 仓库子页面
  const [cangkuPageIndex,setCangkuPageIndex] = useState<any>(0)
  const handleChangeCangkuPageIndex = async (index:any) => {
    setCangkuPageIndex(index)
    if(index==cangkuPageIndex)return
    if(index==0){
      await getCategory()
      await goods_list()
    }
    if(index==1){
      await goods_from_station_to_warehouse_list_goods_on_the_way()
    }
    if(index==2){
      await goods_from_warehouse_to_station_need_transform()
    }
  }
  // 待上架货物列表
  const [shangjiaGoodsList,setShangjiaGoodsList] = useState<any>()
  // 在途货物列表
  const [onWayGoodsList,setOnWayGoodsList] = useState<any>([])
  // 需要运往驿站的货物列表
  const [needTransformGoodsList,setNeedTransformGoodsList] = useState<any>([])
  // 仓库管理员上架货物
  const [goodsId,setGoodsId] = useState<any>()
  const [categoryId,setCategoryId] = useState<any>()
  const [tagName,setTagName] = useState<any>()
  const [title,setTitle] = useState<any>()
  const [urls,setUrls] = useState<any>()
  const [detail,setDetail] = useState<any>()
  const [depreciationRate,setDepreciationRate] = useState<any>()
  const [price,setPrice] = useState<any>()
  const [size,setSize] = useState<any>()
  const [shippingFee,setShippingFee] = useState<any>()
  // 商品类别
  const [category,setCategory] = useState<any>()
  // 获取商品类别，获取完之后自动修改categoryOne
  const getCategory = async()=>{
    // 获取商品类别
    let res = await goods_category_map_one()
    console.log("res1",res)
    console.log(Object.getOwnPropertyNames(res.data))
    const o:any = []
    const keys = Object.getOwnPropertyNames(res.data)
    for(let i=0;i<keys.length;i++){
      const key = keys[i]
      const res2 = await goods_category_map_two(res.data[key])
      const o2:any = []
      Object.getOwnPropertyNames(res2.data).forEach(key=>{
        o2.push({
          label: key,
          value: res2.data[key]
        })
      })

      o.push({
        label: key,
        value: res.data[key],
        children: o2
      })
        
    }
    setCategory(o)
  }
  useEffect(()=>{
    getCategory()
  },[])
  const getTagName = (categoryId:any)=>{
    let tagName = ""
    category?.forEach((item: any)=>{
      item.children.forEach((item:any)=>{
        if(item.value == categoryId){
          tagName = item.label
        }
      })
    })
    return tagName
  }
  // Just show the latest item.
  const cangkuDisplayRender = (labels: string[]) => labels[labels.length - 1];
  const onCangkuCascaderChange = (e:any)=>{
    console.log(e)
    if(e!=undefined){
      setCategoryId(e[1])
    }else{
      setCategoryId(null)
    }
  }
  // 知道是仓库管理员之后一次性要做的请求
  const cangku = async()=>{
    await getCategory()
    await goods_list()
  }
  // 
  interface cangkuShangjiaDataType {
    id: any,
    categoryId: any,
    size: any,
    shippingFee:any,
    title: any,
    depreciationRate: any,
    price: any,
    detail: string;
    url: string;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    comment: string;
    commentHousekeeperAvatar: string;
    commentHousekeeperPhone: string;
    onceListed: any;
  }
  
  const columns: TableProps<cangkuShangjiaDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '描述',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}} onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '管家评论',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: '管家头像',
      dataIndex: 'commentHousekeeperAvatar',
      key: 'commentHousekeeperAvatar',
      render: (_, { commentHousekeeperAvatar }) => (
        <img src={commentHousekeeperAvatar} style={{width:'50px',height: '50px',borderRadius: '50%'}}  onClick={()=>{
          setShowImgs([commentHousekeeperAvatar])
        }}/>
      ),
    },
    {
      title: '管家电话',
      dataIndex: 'commentHousekeeperPhone',
      key: 'commentHousekeeperPhone',
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
        {(record.onceListed == null) && <div style={{width:'100px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}} onClick={()=>
        handlecangkuShangjiaOpen(
          record.id,
          record.url,
          record.onceListed,
          record.categoryId,
          record.title,
          record.detail,
          record.depreciationRate,
          record.price,
          record.size,
          record.shippingFee)}>初次上架</div>}
        {(record.onceListed != null) && <div  onClick={()=>
        handlecangkuShangjiaOpen(
          record.id,
          record.url,
          record.onceListed,
          record.categoryId,
          record.title,
          record.detail,
          record.depreciationRate,
          record.price,
          record.size,
          record.shippingFee)} style={{width:'100px',padding: '10px 20px',backgroundColor: '#ffd70044',borderRadius: '10px',cursor: 'pointer'}}>再次上架</div>}
        </>
      ),
    },
  ];
  // 驿站运来在途货物
  interface cangkuOnwayDataType {
    goodsId: any,
    id: any,
    detail: string;
    url: string;
    province: string;
    city: string;
    distrcit: string;
    community: string;
  }
  
  const onwayColumns: TableProps<cangkuOnwayDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'goodsId',
      key: 'goodsId',
    },
    {
      title: '描述',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <div style={{width:'100px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}}
           onClick={()=>goods_from_station_to_warehouse_confirm_arrive_batch(record.id)}>
            确认收到</div>
        </>
      ),
    },
  ];
  // 要运往仓库的货物
  interface cangkuTransformDataType {
    goodsId: any,
    id: any,
    title: string;
    detail: string;
    url: string;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    depreciationRate: string;
    price: string;
  }
  
  const transformColumns: TableProps<cangkuTransformDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'goodsId',
      key: 'goodsId',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '折旧率',
      dataIndex: 'depreciationRate',
      key: 'depreciationRate',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{width:'100px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}} onClick={()=>goods_from_warehouse_to_station_confirm_depart_batch(record.id)}>确认发出</div>
      ),
    },
  ];



  const [iscangkuShangjiaModalOpen,setIscangkuShangjiaModalOpen] = useState(false)
  const [iscangkuZhijieShangjiaModalOpen,setIscangkuZhijieShangjiaModalOpen] = useState(false)
  const handlecangkuShangjiaOpen = (goodsId: any,urls: any,onceListed:any,
    categoryId:any,
    title:any,
    detail:any,
    depreciationRate:any,
    price: any,
    size:any,
    shippingFee:any
  )=>{
    setGoodsId(goodsId)
    setUrls(urls)
    if(onceListed){
      setCategoryId(categoryId)
      setTitle(title)
      setDetail(detail)
      setDepreciationRate(depreciationRate)
      setPrice(price)
      setSize(size)
      setShippingFee(shippingFee)
    }else{
      setCategoryId(null)
      setTitle(null)
      setDetail(null)
      setDepreciationRate(null)
      setPrice(null)
      setSize(null)
      setShippingFee(null)
    }
    
    setIscangkuShangjiaModalOpen(true)
  }
  const [shangjiaComment,setShangjiaComment] = useState("")
  const handlecangkuShangjiaOk = async ()=>{
    if(shangjiaing){
      return
    }
    if(categoryId==null){
      alert("请选择物品类别")
      return
    }
    if(!title){
      alert("请输入商品标题")
      return
    }
    if(!detail){
      alert("请输入商品描述")
      return
    }
    if(depreciationRate==null){
      alert("请选择物品折旧程度")
      return
    }
    if(price==null){
      alert("请输入商品价格")
      return
    }
    if(size==null){
      alert("请选择物品型号")
      return
    }
    if(size==4&&shippingFee==null){
      alert("请输入物品运费")
      return
    }
    // 
    const tagName = getTagName(categoryId)
    
    const res = await goods_put_on_sale(goodsId,categoryId,tagName,title,urls,detail,depreciationRate,price,size,shippingFee)
    if(res.success){
      message.success("上架成功")
      setIscangkuShangjiaModalOpen(false)
      await goods_list()
    }else{
      message.error(res.message)
      await goods_list()
    }
  }
  const [zhijieCount,setZhijieCount] = useState<any>()
  const handlecangkuZhijieShangjiaOk = async ()=>{
    if(shangjiaing){
      return
    }
    if(urls==null||urls.length==0){
      alert("请上传物品图片")
      return
    }
    if(categoryId==null){
      alert("请选择物品类别")
      return
    }
    if(!title){
      alert("请输入商品标题")
      return
    }
    if(!detail){
      alert("请输入商品描述")
      return
    }
    if(depreciationRate==null){
      alert("请选择物品折旧程度")
      return
    }
    if(price==null){
      alert("请输入商品价格")
      return
    }
    if(size==null){
      alert("请选择物品型号")
      return
    }
    if(size==4&&shippingFee==null){
      alert("请输入物品运费")
      return
    }
    if(shangjiaComment.length==0){
      alert("请输入物品评论")
      return
    }
    if(!zhijieCount){
      alert("请输入物品数量")
      return
    }
    // 
    const tagName = getTagName(categoryId)
    
    const res = await goods_zhijie_put_on_sale(categoryId,tagName,title,urls.join("gousk666"),detail,depreciationRate,price,size,shippingFee,shangjiaComment,zhijieCount)
    if(res.success){
      message.success("上架成功")
      setIscangkuZhijieShangjiaModalOpen(false)
    }else{
      message.error(res.message)
    }
    setCategoryId(null)
    setTitle(null)
    setUrls([])
    setDetail(null)
    setDepreciationRate(null)
    setPrice(null)
    setSize(null)
    setShippingFee(null)
    setShangjiaComment("")
  }
  const handlecangkuZhijieShangjiaCancel = ()=>{
    setIscangkuZhijieShangjiaModalOpen(false)
  }
  const handlecangkuShangjiaCancel = ()=>{
    setIscangkuShangjiaModalOpen(false)
  }
  const [shangjiaing,setShangjiaing] = useState(false)

  // 折旧率
  const depreciationRateList = [
    {value:"全新",label:"全新"},
    {value:"99新",label:"99新"},
    {value:"95新",label:"95新"},
    {value:"9成新",label:"9成新"},
    {value:"85新",label:"85新"},
    {value:"8成新",label:"8成新"},
    {value:"75新",label:"75新"},
    {value:"7成新",label:"7成新"},
    {value:"65新",label:"65新"},
    {value:"6成新",label:"6成新"},
    {value:"55新",label:"55新"},
    {value:"5成新",label:"5成新"},
    {value:"45新",label:"45新"},
    {value:"4成新",label:"4成新"},
    {value:"35新",label:"35新"},
    {value:"3成新",label:"3成新"},
    {value:"25新",label:"25新"},
    {value:"2成新",label:"2成新"},
    {value:"15新",label:"15新"},
    {value:"1成新",label:"1成新"}
  ]
  const sizeList = [
    {value:"0",label:"小件"},
    {value:"1",label:"中件"},
    {value:"2",label:"大件"},
    {value:"3",label:"超大件"},
    {value:"4",label:"其他(需填写运费)"},
  ]


  // 站长相关================================================================================
  // 站长的几个接口
  // 站长获取自己手下的管家的列表
  const station_master_list_housekeeper = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/list/housekeeper`, {
        headers:{
          token: userInfo.token
        },
        method: "GET",
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长获取自己手下的管家的列表",result)
      setHouseKeeperList(result.data)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长添加管家
  const station_master_add_housekeeper = async(phone: any,username: any)=>{
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("username", username);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/add/housekeeper`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长添加管家",result)
      if(result.success){
        message.success("添加成功")
      }else{
        message.error(result.message)
      }
      station_master_list_yunying()
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长删除管家
  const station_master_remove_housekeeper = async(id: any)=>{
    const formData = new FormData();
    formData.append("id", id);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/remove/housekeeper`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长删除管家",result)
      if(result.success){
        message.success("删除成功")
      }else{
        message.success("删除失败")
      }
      station_master_list_yunying()

    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长获取自己手下的运营专员的列表
  const station_master_list_yunying = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/list/operator`, {
        headers:{
          token: userInfo.token
        },
        method: "GET",
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长获取自己手下的运营的列表",result)
      setYunyingList(result.data)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长添加运营专员
  const station_master_add_yunying = async(phone: any,username: any)=>{
    const formData = new FormData();
    formData.append("phone", tianjiaPhoneYunying);
    formData.append("username", tianjiaUsernameYunying);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/add/operator`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长添加运营",result)
      if(result.success){
        message.success("添加成功")
      }else{
        message.error(result.message)
      }
      station_master_list_yunying()
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长删除运营专员
  const station_master_remove_yunying = async(id: any)=>{
    const formData = new FormData();
    formData.append("id", id);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}station_master/remove/operator`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长删除运营",result)
      if(result.success){
        message.success("删除成功")
      }else{
        message.success("删除失败")
      }
      station_master_list_yunying()

    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长获取待估价列表
  const assign_task_not_evaluate_list = async()=>{
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}assign_task/not_evaluate_list`, {
        headers:{
          token: userInfo.token
        },
        method: "GET"
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长获取待估价列表",result)
      const list1:any = []
      result.data.forEach((item:any) => {
        list1.push(...item.assignTaskList)
      });
      await getCategory()
      setEvaluateList(list1)
      console.log("list1",list1)
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 站长估价
  const assign_task_station_master_set_price = async(taskId:any,price:any)=>{
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("price", price);
    try {
      // 用 fetch 发送 POST 请求（无需手动设置 Content-Type）
      const response = await fetch(`${url}assign_task/station_master_set_price`, {
        headers:{
          token: userInfo.token
        },
        method: "POST",
        body: formData
      });

      // 处理非 200 状态码
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("站长估价",result)
      return result
    } catch (error) {
      console.error("请求错误:", error);
      throw error; // 向上传递错误
    }
  }
  // 回收估价
  interface gujiaDataType {
    id: any,
    goodsCategory: any,
    url: string;
    housekeeperDescUrlList: string;
    descri: string;
    housekeeperDesc: string;
    housekeeperName: string;
    housekeeperPhone: string;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
    phone: string;
  }
  
  const gujiaColumns: TableProps<gujiaDataType>['columns'] = [
    {
      title: '品类',
      dataIndex: 'goodsCategory',
      key: 'goodsCategory',
      render: (_, { goodsCategory }) => (
        getTagName(goodsCategory)
      ),
    },
    {
      title: '用户拍照',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '管家拍照',
      dataIndex: 'housekeeperDescUrlList',
      key: 'housekeeperDescUrlList',
      render: (_, { housekeeperDescUrlList }) => (
        <img src={housekeeperDescUrlList.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(housekeeperDescUrlList.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '用户描述',
      dataIndex: 'descri',
      key: 'descri',
    },
    {
      title: '管家描述',
      dataIndex: 'housekeeperDesc',
      key: 'housekeeperDesc',
    },
    {
      title: '管家昵称',
      dataIndex: 'housekeeperName',
      key: 'housekeeperName',
    },
    {
      title: '管家电话',
      dataIndex: 'housekeeperPhone',
      key: 'housekeeperPhone',
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    },
    {
      title: '用户电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{width:'70px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}} onClick={()=>handleGujiaOpen(record.id,record.housekeeperDescUrlList)}>估价</div>
      ),
    },
  ];
  // 管家列表
  // 回收估价
  interface housekeeperDataType {
    id: any,
    username: any,
    phone: string;
    avatarUrl: string;
    star: any;
    level: any;
    serviceCount: any;
    userCommentCount: any;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
  }
  
  const housekeeperColumns: TableProps<housekeeperDataType>['columns'] = [
    {
      title: '管家ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      render: (_, { avatarUrl }) => (
        <img src={avatarUrl} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs([avatarUrl])
        }}/>
      ),
    },
    {
      title: '平均评分',
      dataIndex: 'star',
      key: 'star',
    },
    {
      title: '经验',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '服务次数',
      dataIndex: 'serviceCount',
      key: 'serviceCount',
    },
    {
      title: '用户评价数',
      dataIndex: 'userCommentCount',
      key: 'userCommentCount',
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{width:'70px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}} onClick={()=>station_master_remove_housekeeper(record.id)}>下岗</div>
      ),
    },
  ];
  interface yunyingDataType {
    id: any,
    username: any,
    phone: string;
    avatarUrl: string;
    star: any;
    level: any;
    serviceCount: any;
    userCommentCount: any;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
  }
  
  const yunyingColumns: TableProps<yunyingDataType>['columns'] = [
    {
      title: '运营专员ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      render: (_, { avatarUrl }) => (
        <img src={avatarUrl} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs([avatarUrl])
        }}/>
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{width:'70px',padding: '10px 20px',backgroundColor: '#50b9fe44',borderRadius: '10px',cursor: 'pointer'}} onClick={()=>station_master_remove_yunying(record.id)}>下岗</div>
      ),
    },
  ];
  // 站长手下的管家列表
  const [houseKeeperList,setHouseKeeperList] = useState<any>([])
  // 添加管家
  const [tianjiaPhone,setTianjiaPhone] = useState<any>()
  const [tianjiaUsername,setTianjiaUsername] = useState<any>()
  // 站长手下的运营列表
  const [yunyingList,setYunyingList] = useState<any>([])
  // 添加运营
  const [tianjiaPhoneYunying,setTianjiaPhoneYunying] = useState<any>()
  const [tianjiaUsernameYunying,setTianjiaUsernameYunying] = useState<any>()
  // 待估价列表
  const [evaluateList,setEvaluateList] = useState<any>([])
  // 估价弹窗
  const [gujiaTaskId,setGujiaTaskId] = useState<any>()
  const [gujiaUrls,setGujiaUrls] = useState<any>()
  const [gujiaPrice,setGujiaPrice] = useState<any>()
  const [isGujiaModalOpen,setGujiaModalOpen] = useState(false)
  const [gujiaing,setGujiaing] = useState(false)
  const handleGujiaOpen = (taskId: any,urls: any)=>{
    setGujiaTaskId(taskId)
    setGujiaUrls(urls)
    setGujiaPrice(null)
    setGujiaModalOpen(true)
  }
  const handleGujiaOk = async ()=>{
    if(gujiaing){
      return
    }
    if(gujiaPrice==null){
      alert("请输入物品估价")
      return
    }
    
    const res = await assign_task_station_master_set_price(gujiaTaskId,gujiaPrice)
    if(res.success){
      message.success("估价成功")
      setGujiaModalOpen(false)
      await assign_task_not_evaluate_list()
    }else{
      message.error(res.message)
      await assign_task_not_evaluate_list()
    }
  }
  const handleGujiaCancel = ()=>{
    setGujiaModalOpen(false)
  }
  // 站长子页面
  const [zhanzhangPageIndex,setZhanzhangPageIndex] = useState<any>(0)
  const handleChangeZhanzhangPageIndex = async (index:any) => {
    console.log("handleChangeZhanzhangPageIndex",index==0)
    setZhanzhangPageIndex(index)
    if(index==zhanzhangPageIndex)return
    if(index==0){
      console.log("assign_task_not_evaluate_list")
      await assign_task_not_evaluate_list()
    }
    if(index==1){
      await station_master_list_housekeeper()
      station_master_list_yunying()

    }
    if(index==2){
      // await goods_from_warehouse_to_station_need_transform()
    }
  }
  // 站长查看管家的任务单
  const [type,setType] = useState<any>("assign_task")
  const [done,setDone] = useState<any>(false)
  const [assignTaskList,setAssignTaskList] = useState<any>()
  const [consignmentSaleOrderTask,setConsignmentSaleOrderTask] = useState<any>()
  const [offerDoorTask,setOfferDoorTask] = useState<any>()
  const [startTime,setStartTime] = useState<any>()
  const [endTime,setEndTime] = useState<any>()
  const [housekeeperIds,setHousekeeperIds] = useState<any>()

  interface assignTaskListDataType {
    goodsId: any,
    id: any,
    goodsCategory: any,
    housekeeperId: any,
    url: string;
    housekeeperDescUrlList: string;
    descri: any;
    housekeeperDesc: any;
    isComment: any;
    sellCategory: any;
    star: any;
    startTime: any;
    endTime: any;
    arriveTime: any;
    status: any;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
  }
  
  const assignTaskListColumns: TableProps<assignTaskListDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'goodsId',
      key: 'goodsId'
    },
    {
      title: '品类',
      dataIndex: 'goodsCategory',
      key: 'goodsCategory',
      render: (_, { goodsCategory }) => (
        getTagName(goodsCategory)
      ),
    },
    {
      title: '管家ID',
      dataIndex: 'housekeeperId',
      key: 'housekeeperId'
    },
    {
      title: '用户拍照',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '管家拍照',
      dataIndex: 'housekeeperDescUrlList',
      key: 'housekeeperDescUrlList',
      render: (_, { housekeeperDescUrlList }) => (
      <>
       {housekeeperDescUrlList&&<img src={housekeeperDescUrlList.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(housekeeperDescUrlList.split("gousk666"))
        }}/>}  
      </>     
      ),
    },
    {
      title: '用户描述',
      dataIndex: 'descri',
      key: 'descri'
    },
    {
      title: '管家描述',
      dataIndex: 'housekeeperDesc',
      key: 'desc'
    },
    {
      title: '管家评论',
      dataIndex: 'isComment',
      key: 'isComment',
      render: (_, { isComment }) => (
        <>
         {isComment?'isComment':'未评论'}  
        </>     
      ),
    },
    {
      title: '回收方式',
      dataIndex: 'sellCategory',
      key: 'sellCategory',
      render: (_, { sellCategory }) => (
        <>
         {sellCategory==0?'待回收':sellCategory==1?'平台收购':'寄卖'}  
        </>     
      ),
    },
    {
      title: '用户打分',
      dataIndex: 'star',
      key: 'star',
      render: (_, { star }) => (
        <>
         {star==null?'未打分':star}  
        </>     
      ),
    },
    {
      title: '预期上门时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (_, { startTime,endTime }) => (
        <>
         {startTime.replace("T"," ")+endTime.replace("T"," ")}  
        </>     
      ),
    },
    {
      title: '管家上门时间',
      dataIndex: 'arriveTime',
      key: 'arriveTime',
      render: (_, { arriveTime }) => (
        <>
         {arriveTime.replace("T"," ")}  
        </>     
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <>
         {status==1?'待抢单':status==2?'已抢单还未上门':status==3?'已确认上门':status==4?'已完成':status==5?'已收购或者寄卖':"废弃"}  
        </>     
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    }
  ];
  interface consignmentSaleDataType {
    goodsId: any,
    id: any,
    tagName: any,
    housekeeperId: any,
    url: string;
    title: string;
    detail: any;
    size: any,
    price: any,
    star: any;
    status: any;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
  }
  
  const consignmentSaleColumns: TableProps<consignmentSaleDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'goodsId',
      key: 'goodsId'
    },
    {
      title: '品类',
      dataIndex: 'tagName',
      key: 'tagName'
    },
    {
      title: '管家ID',
      dataIndex: 'housekeeperId',
      key: 'housekeeperId'
    },
    {
      title: '物品图片',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '物品标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '物品描述',
      dataIndex: 'detail',
      key: 'detail'
    },
    {
      title: '物品型号',
      dataIndex: 'size',
      key: 'size',
      render: (_, { size }) => (
        <>
         {size==1?'小件':size==2?'中件':size==3?'大件':size==4?'超大件':"其他"}  
        </>     
      ),
    },
    {
      title: '物品价格',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: '用户打分',
      dataIndex: 'star',
      key: 'star',
      render: (_, { star }) => (
        <>
         {star==null?'未打分':star}  
        </>     
      ),
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <>
         {status==1?'待抢单':status==2?'已抢单还未上门':status==3?'已确认上门':status==4?'货物已经放到驿站':status==5?'已完成':"废弃"}  
        </>     
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    }
  ];
  interface offerDoorDataType {
    goodsId: any,
    id: any,
    tagName: any,
    housekeeperId: any,
    url: string;
    title: string;
    detail: any;
    size: any,
    price: any,
    star: any;
    status: any;
    province: string;
    city: string;
    distrcit: string;
    community: string;
    residentialCommunity: string;
    locationDetail: string;
  }
  
  const offerDoorColumns: TableProps<offerDoorDataType>['columns'] = [
    {
      title: '商品编号',
      dataIndex: 'goodsId',
      key: 'goodsId'
    },
    {
      title: '品类',
      dataIndex: 'tagName',
      key: 'tagName'
    },
    {
      title: '管家ID',
      dataIndex: 'housekeeperId',
      key: 'housekeeperId'
    },
    {
      title: '物品图片',
      dataIndex: 'url',
      key: 'url',
      render: (_, { url }) => (
        <img src={url.split("gousk666")[0]} style={{width:'50px',height: '50px'}}  onClick={()=>{
          setShowImgs(url.split("gousk666"))
        }}/>
      ),
    },
    {
      title: '物品标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '物品描述',
      dataIndex: 'detail',
      key: 'detail'
    },
    {
      title: '物品型号',
      dataIndex: 'size',
      key: 'size',
      render: (_, { size }) => (
        <>
         {size==1?'小件':size==2?'中件':size==3?'大件':size==4?'超大件':"其他"}  
        </>     
      ),
    },
    {
      title: '物品价格',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: '用户打分',
      dataIndex: 'star',
      key: 'star',
      render: (_, { star }) => (
        <>
         {star==null?'未打分':star}  
        </>     
      ),
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <>
         {status==1?'待抢单':status==2?'已抢单还未送到':status==3?'已完成':"废弃"}  
        </>     
      ),
    },
    {
      title: '省',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '社区',
      dataIndex: 'community',
      key: 'community',
    },
    {
      title: '小区',
      dataIndex: 'residentialCommunity',
      key: 'residentialCommunity',
    },
    {
      title: '详细住址',
      dataIndex: 'locationDetail',
      key: 'locationDetail',
    }
  ];

  const handleChangeDate = (e:any)=>{
    const startTime = dayjs(e[0]).format('YYYY-MM-DD HH:mm:ss')
    const endTime = dayjs(e[1]).format('YYYY-MM-DD HH:mm:ss')
    setStartTime(startTime)
    setEndTime(endTime)
  }
  // 查询
  const handleChaxun = async()=>{
    if(!housekeeperIds){
      message.error("请填写要查询的管家的id")
      return
    }
    if(!type){
      message.error("请选择要查询的任务类型")
      return
    }
    if(done==null||done==undefined){
      message.error("请选择要查询的任务的完成状态")
      return
    }
    if(!startTime || !endTime){
      message.error("请选择查询的时间范围")
      return
    }
    const housekeeperIDs = housekeeperIds.split(",")
    if(type == 'assign_task'){
      const response = await fetch(`${url}station_master/list/assign_task`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          housekeeperIds:housekeeperIDs,
          finish: done,
          startTime,
          endTime
        })
      }); 
      const result = await response.json();
      console.log(result)
      let list:any = []
      result.data.forEach((item:any)=>{
        list = list.concat(item.taskList)
      })
      console.log(list)
      setAssignTaskList(list)
    }
    if(type == 'consignment_sale_order_task'){
      const response = await fetch(`${url}station_master/list/consignment_sale_order_task`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          housekeeperIds:housekeeperIDs,
          finish: done,
          startTime,
          endTime
        })
      }); 
      const result = await response.json();
      console.log(result)
      let list:any = []
      result.data.forEach((item:any)=>{
        list = list.concat(item.taskList)
      })
      console.log(list)
      setConsignmentSaleOrderTask(list)
    }
    if(type == 'offer_door_task'){
      const response = await fetch(`${url}station_master/list/offer_door_task`, {
        headers:{
          token: userInfo.token,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          housekeeperIds:housekeeperIDs,
          finish: done,
          startTime,
          endTime
        })
      }); 
      const result = await response.json();
      console.log(result)
      let list:any = []
      result.data.forEach((item:any)=>{
        list = list.concat(item.taskList)
      })
      console.log(list)
      setOfferDoorTask(list)
    }
  }


  const handlexxx = (e:any)=>{
    console.log(e)
  }
  const handleChangeLoginType = ()=>{
    if(loginType=='phone'){
      setLoginType("username")
    }else{
      setLoginType("phone")
    }
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const [fileList, setFileList] = useState<any>([

  ]);
  const props = {
    onRemove: (file:any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file:any) => {
      setFileList([...fileList, file]);

      // return false;
    },
    fileList,
  };
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const handlePreview = async (file:any) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange:any = ({ fileList }:any) =>
   {
    console.log("fileList", fileList)
    setFileList(fileList);
   }
     // 重点-上传方法
  const upload = (data:any) => {
    console.log("upload",data)
    //配置里面获取
    const obsClient = new ObsClient({
      access_key_id: "YQNP6Y5MSEUJOIETVSM7",
      secret_access_key: "VVUnk0sO9rMuQ2wk90s6gOdF56NBK6P7cjkX5Di2",
      server: "obs.cn-north-4.myhuaweicloud.com"
    });
    // 设置表单参数
    var formParams = {
      // 设置对象访问权限为公共读
      'x-obs-acl': obsClient.enums.AclPublicRead,
      // 设置对象MIME类型
      'content-type': 'text/plain'
    };
    // 设置表单上传请求有效期，单位：秒
    var expires = 3600;
    var res = obsClient.createPostSignatureSync({
      Expires: expires,
      FormParams: formParams
    });
    const rand = new Date().getTime()
    const url = `https://shiyanshiapp.obs.cn-north-4.myhuaweicloud.com/hlgj_cangkushangjia_rand${rand}.jpg`
    obsClient.putObject(
      {
        Bucket: "shiyanshiapp", // 桶名称
        Key: `hlgj_cangkushangjia_rand${rand}.jpg`, // 桶内对象文件存储地址 文件夹名称+上传文件名
        SourceFile: data.file,
        Policy: res.Policy, // 策略
        Signature: res.Signature, //签名
        expires
      },
      function(err: string, result: { CommonMsg: { Status: number; }; }) {
        if (err) {
          //此处上传失败后 可以调 data.onError方法报错
          console.log('Error-->' + err);
          data.onError();
        } else {
          //此处上传成功后 可以调 data.onSuccess更改文件上传对象的状态
          console.log('Status-->', result);
          data.onSuccess();
          if(urls!=null){
            setUrls([...urls,url])
          }else{
            setUrls([url])
          }
        }
      }
    );
  }

  // 预览多张图片
  const [showImgs,setShowImgs] = useState<any>([])
  return (
    <>
      {page === "loginPage" && (
        <div className="loginPage">
          <div className="loginArea">
            <div className="texts">
              <div className="text1">Hello!</div>
              <div className="text2">欢迎登录好邻管家</div>
            </div>

            {/* 手机号输入（已实现双向绑定） */}
            {
              loginType=='phone'&&<div className="phoneInput">
              <div className="inputArea">
                <div className="phoneInputPrefix">+86</div>
                <div className="split">|</div>
                <input
                  type="text"
                  className="phoneInputBox"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={handlePhoneChange} // 绑定变更事件
                />
              </div>
              <div className="line"></div>
            </div>
            }

            {/* 验证码输入（已实现双向绑定） */}
            {
              loginType=='phone'&&<div className="verifyCodeInput">
              <div className="inputArea">
                <input
                  type="text"
                  className="phoneInputBox"
                  placeholder="请输入短信验证码"
                  value={verifyCode}
                  onChange={handleVerifyChange} // 绑定变更事件
                />
                <div className="getCode" onClick={handleGetVerifyCode}>
                  {getVerifyCodeColdTime === 0 
                    ? "获取验证码" 
                    : `${getVerifyCodeColdTime}秒后可重发`}
                </div>
              </div>
              <div className="line"></div>
            </div>
            }

            {/* 用户名输入（已实现双向绑定） */}
            {
              loginType=='username'&&<div className="phoneInput">
              <div className="inputArea">
               
                <input
                  type="text"
                  className="phoneInputBox"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)} // 绑定变更事件
                />
              </div>
              <div className="line"></div>
            </div>
            }

            {/* 密码输入（已实现双向绑定） */}
            {
              loginType=='username'&&<div className="verifyCodeInput">
              <div className="inputArea">
                <input
                  type="text"
                  className="phoneInputBox"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)} // 绑定变更事件
                />
              </div>
              <div className="line"></div>
            </div>
            }

            <div className="change" onClick={handleChangeLoginType}>
              {loginType=='phone'?'用户名密码登录':'短信验证码登录'}
            </div>

            <div className="loginBtn" onClick={handleLogin}>
              {isLogining ? "正在登录..." : "立即登录"}
            </div>
          </div>
        </div>
      )}

      {/* 其他页面保持原有逻辑 */}
      {page === "zhanzhangPage" && 
      <div className="zhanzhangPage">
          <div className="left">
            <div className="tabs">
              <div onClick={()=>handleChangeZhanzhangPageIndex(0)} className={`tab-item ${zhanzhangPageIndex==0?'tab-item-active':''}`}>
                <img src={gujia}/>
                <div className="text">回收估价</div>
              </div>
              <div onClick={()=>handleChangeZhanzhangPageIndex(1)} className={`tab-item ${zhanzhangPageIndex==1?'tab-item-active':''}`}>
                <img src={guanli}/>
                <div className="text">人员管理</div>
              </div>
              <div onClick={()=>handleChangeZhanzhangPageIndex(2)} className={`tab-item ${zhanzhangPageIndex==2?'tab-item-active':''}`}>
                <img src={jixiao}/>
                <div className="text">工作总览</div>
              </div>
            </div>
          </div>
            {zhanzhangPageIndex==0 &&
              <>
              <div className="right">
                <Table<gujiaDataType> columns={gujiaColumns} dataSource={evaluateList} />
              </div>
              <Modal cancelText="取消" okText="估价" title="站长给物品估价" open={isGujiaModalOpen} onOk={handleGujiaOk} onCancel={handleGujiaCancel}>
                <div className="row">
                  <img src={gujiaUrls?.split("gousk666")[0]} style={{width:'100px',height: '100px',margin: '20px auto'}} />
                </div>
                {/* 输入价格 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>价格：</div>
                  <InputNumber min={0.01} style={{width: '300px'}} placeholder="请输入商品价格" value={gujiaPrice} onChange={(e)=>{setGujiaPrice(e)}}/>
                </div>
              </Modal>
              </>
            }
            {zhanzhangPageIndex==1 &&
              <>
              <div className="right" style={{display: 'flex',flexDirection:'column',padding: '0',margin:'0',justifyContent: 'flex-start'}}>
                <div className="guanjia" style={{marginRight: '3em',flexShrink:0}}>
                  <div style={{display: 'flex',alignItems:'center',padding: '20px 0',margin:'0'}}>
                    <div className="row">
                      <div style={{width: '4em',flexShrink: 0}}>用户名：</div>
                      <Input placeholder="请输入用户名" value={tianjiaUsername} onChange={(e)=>{setTianjiaUsername(e.target.value)}}/>
                    </div>
                    <div className="row" style={{margin: '0 20px'}}>
                      <div style={{width: '4em',flexShrink: 0}}>手机号：</div>
                      <Input placeholder="请输入手机号" value={tianjiaPhone} onChange={(e)=>{setTianjiaPhone(e.target.value)}}/>
                    </div>
                    <Button type="primary" onClick={()=>station_master_add_housekeeper(tianjiaPhone,tianjiaUsername)}>添加管家</Button>
                  </div>
                  <Table<housekeeperDataType> columns={housekeeperColumns} dataSource={houseKeeperList} />
                </div>
                <div className="yunying"  style={{marginRight: '3em',flexShrink:0}}>
                  <div style={{display: 'flex',alignItems:'center',padding: '20px 0',margin:'0'}}>
                    <div className="row">
                      <div style={{width: '4em',flexShrink: 0}}>用户名：</div>
                      <Input placeholder="请输入用户名" value={tianjiaUsername} onChange={(e)=>{setTianjiaUsernameYunying(e.target.value)}}/>
                    </div>
                    <div className="row" style={{margin: '0 20px'}}>
                      <div style={{width: '4em',flexShrink: 0}}>手机号：</div>
                      <Input placeholder="请输入手机号" value={tianjiaPhone} onChange={(e)=>{setTianjiaPhoneYunying(e.target.value)}}/>
                    </div>
                    <Button type="primary" onClick={()=>station_master_add_yunying(tianjiaPhone,tianjiaUsername)}>添加运营</Button>
                  </div>
                  <Table<yunyingDataType> columns={yunyingColumns} dataSource={yunyingList} />
                </div>
              </div>
              </>
            }
            {zhanzhangPageIndex==2 &&
              <>
              <div className="right" style={{display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent:'flex-start'}}>
                <div className="topRow" style={{display:'flex',alignItems:'center',marginBottom: '30px'}}>
                  <div className="row" style={{margin: '0 10px'}}>
                    <div className="text" style={{width:'4em',flexShrink: '0'}}>管家ID:</div>
                    <Input style={{width: '300px'}} placeholder="请输入管家ID,多个ID用 , 分隔。例如：1,2" value={housekeeperIds} onChange={(e)=>{setHousekeeperIds((e.target.value).replace("，",","))}}/>
                  </div>
                  <div className="row" style={{margin: '0 10px'}}>
                    <div className="text" style={{width:'5em',flexShrink: '0'}}>任务类型:</div>
                    <Cascader 
                    placeholder="请选择任务类型" 
                    options={[
                      {
                        label: "物换积分预约单",
                        value: 'assign_task'
                      },
                      {
                        label: "寄卖取货",
                        value: 'consignment_sale_order_task'
                      },
                      {
                        label: "送货上门",
                        value: 'offer_door_task'
                      }
                    ]}
                    value={type} 
                    onChange={(e)=>{setType(e?e[0]:undefined)}}
                    />
                  </div>
                  <div className="row" style={{margin: '0 10px'}}>
                    <div className="text"  style={{width:'5em',flexShrink: '0'}}>是否完成:</div>
                    <Cascader
                     placeholder="请选择完成状态" 
                     options={[
                      {
                        label: "已完成",
                        value: "true"
                      },
                      {
                        label: "待完成",
                        value: "false"
                      }
                    ]}
                     value={done} 
                     onChange={(e)=>{setDone(e?e[0]:undefined)}}
                     />
                  </div>
                  <div className="row" style={{margin: '0 10px'}}>
                    <div className="text"  style={{width:'3em',flexShrink: '0'}}>时间:</div>
                    <RangePicker
                      showTime={{
                        defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
                      }}
                      format="YYYY-MM-DD HH:mm:ss"
                      onChange={(e)=>{handleChangeDate(e)}}
                      style={{width: '400px'}}
                    />
                  </div>
                  <div className="row" style={{margin: '0 10px'}}>
                    <Button type="primary" onClick={handleChaxun}>查询</Button>
                  </div>
                </div>
                {
                  type=='assign_task'&& 
                  <div className="right">
                    {/* {assignTaskList} */}
                    <Table<assignTaskListDataType> columns={assignTaskListColumns} dataSource={assignTaskList} />
                  </div>
                }
                {
                  type=='consignment_sale_order_task'&& 
                  <div className="right">
                    <Table<consignmentSaleDataType> columns={consignmentSaleColumns} dataSource={consignmentSaleOrderTask} />
                  </div>
                }
                {
                  type=='offer_door_task'&& 
                  <div className="right">
                    <Table<offerDoorDataType> columns={offerDoorColumns} dataSource={offerDoorTask} />
                  </div>
                }
              </div>
              </>
            }
      </div>}
      {page === "cangkuPage" && 
      <div className="cangkuPage">
          <div className="left">
            <div className="tabs">
              <div onClick={()=>handleChangeCangkuPageIndex(0)} className={`tab-item ${cangkuPageIndex==0?'tab-item-active':''}`}>
                <img src={shangjia}/>
                <div className="text">货物上架</div>
              </div>
              <div onClick={()=>handleChangeCangkuPageIndex(1)} className={`tab-item ${cangkuPageIndex==1?'tab-item-active':''}`}>
                <img src={yunlai}/>
                <div className="text">驿站运来</div>
              </div>
              <div onClick={()=>handleChangeCangkuPageIndex(2)} className={`tab-item ${cangkuPageIndex==2?'tab-item-active':''}`}>
                <img src={yunzou}/>
                <div className="text">发往驿站</div>
              </div>
            </div>
          </div>
            {cangkuPageIndex==0 &&
              <>
              <div className="right" style={{display: "flex",flexDirection: 'column',justifyContent: 'start'}}>
                <Button type="primary" onClick={()=>setIscangkuZhijieShangjiaModalOpen(true)}>直接上架+{iscangkuZhijieShangjiaModalOpen}</Button>
                <Table<cangkuShangjiaDataType> columns={columns} dataSource={shangjiaGoodsList} />
              </div>
              <Modal cancelText="取消" okText="上架！" title="初次上架需填写货物信息,再次可以自动填" open={iscangkuShangjiaModalOpen} onOk={handlecangkuShangjiaOk} onCancel={handlecangkuShangjiaCancel}>
                <div className="row">
                  <img src={iscangkuShangjiaModalOpen?urls.split("gousk666")[0]:''} style={{width:'100px',height: '100px'}} />
                </div>
                {/* 选择类别 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>类别：</div>
                  <Cascader
                    options={category}
                    value={[null,getTagName(categoryId)]}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={onCangkuCascaderChange}
                  />
                </div>
                {/* 输入标题 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>标题：</div>
                  <Input placeholder="请输入商品标题" value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
                </div>
                {/* 输入描述 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>描述：</div>
                  <Input placeholder="请输入商品描述" value={detail} onChange={(e)=>{setDetail(e.target.value)}}/>
                </div>
                {/* 选择折旧率 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>折旧：</div>
                  <Cascader
                    options={depreciationRateList}
                    value={depreciationRate}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={(e)=>setDepreciationRate(e?e[0]:null)}
                  />
                </div>
                {/* 输入价格 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>价格：</div>
                  <InputNumber min={0.01} style={{width: '300px'}} placeholder="请输入商品价格" value={price} onChange={(e)=>{setPrice(e)}}/>
                </div>
                {/* 选择型号 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>型号：</div>
                  <Cascader
                    options={sizeList}
                    value={size}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={(e)=>setSize(e?e[0]:null)}
                  />
                </div>
                {/* 如果型号为5，需要输入运费 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>运费：</div>
                  <InputNumber min={0} style={{width: '300px'}} placeholder="型号为其他时，请输入商品运费" value={shippingFee} onChange={(e)=>{setShippingFee(e)}}/>
                </div>
              </Modal>
              <Modal cancelText="取消" okText="上架！" title="直接录入物品到系统并上架平台自卖" open={iscangkuZhijieShangjiaModalOpen} onOk={handlecangkuZhijieShangjiaOk} onCancel={handlecangkuZhijieShangjiaCancel}>
                <Upload
                  listType="picture-card"
                  {...props}
                  accept=".jpg,.jpeg,.png,.gif"
                  onPreview={handlePreview}
                  onChange={handleChange}
                  customRequest={upload}
                  onRemove={(file) => {
                    const uid = file.uid;
                    let index: number
                    for(let i=0;i<fileList.length;i++){
                      if(fileList[i].uid==uid){
                        index = i;
                        break;
                      }
                    }
                    let newfileList:any = fileList.filter(
                      (f: { uid: string; }) => f.uid != uid
                    );
                    let newUrls = urls.filter(
                      (url: any) => urls[index] != url
                    );
                    setFileList(newfileList)
                    setUrls(newUrls)
                  }}
                >
                  {fileList.length >= 8 ? null : uploadButton}
                </Upload>
                {/* 选择类别 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>类别：</div>
                  <Cascader
                    options={category}
                    value={[null,getTagName(categoryId)]}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={onCangkuCascaderChange}
                  />
                </div>
                {/* 输入标题 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>标题：</div>
                  <Input placeholder="请输入商品标题" value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
                </div>
                {/* 输入评论 */}
                  <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>评论：</div>
                  <Input placeholder="请输入商品评论" value={shangjiaComment} onChange={(e)=>{setShangjiaComment(e.target.value)}}/>
                </div>
                {/* 输入描述 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>描述：</div>
                  <Input.TextArea placeholder="请输入商品描述" value={detail} onChange={(e)=>{setDetail(e.target.value)}}/>
                </div>
                {/* 选择折旧率 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>折旧：</div>
                  <Cascader
                    options={depreciationRateList}
                    value={depreciationRate}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={(e)=>setDepreciationRate(e?e[0]:null)}
                  />
                </div>
                {/* 输入价格 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>价格：</div>
                  <InputNumber min={0.01} style={{width: '300px'}} placeholder="请输入商品价格" value={price} onChange={(e)=>{setPrice(e)}}/>
                </div>
                {/* 输入数量 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>数量：</div>
                  <InputNumber min={1} step={1} style={{width: '300px'}} placeholder="请输入商品数量" value={zhijieCount} onChange={(e)=>{setZhijieCount(e)}}/>
                </div>
                {/* 选择型号 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>型号：</div>
                  <Cascader
                    options={sizeList}
                    value={size}
                    expandTrigger="hover"
                    displayRender={cangkuDisplayRender}
                    onChange={(e)=>setSize(e?e[0]:null)}
                  />
                </div>
                {/* 如果型号为5，需要输入运费 */}
                <div className="row">
                  <div style={{width: '3em',flexShrink: 0}}>运费：</div>
                  <InputNumber min={0} style={{width: '300px'}} placeholder="型号为其他时，请输入商品运费" value={shippingFee} onChange={(e)=>{setShippingFee(e)}}/>
                </div>
              </Modal>
              </>
            }
            {cangkuPageIndex==1 &&
              <>
              <div className="right">
                <Table<cangkuOnwayDataType> columns={onwayColumns} dataSource={onWayGoodsList} />
              </div>
              </>
            }
            {cangkuPageIndex==2 &&
              <>
              <div className="right">
                <Table<cangkuTransformDataType> columns={transformColumns} dataSource={needTransformGoodsList} />
              </div>
              </>
            }
          {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
      )}
        
      </div>}
      {
        showImgs.length!=0&&<PreviewGroup
        preview={{
          visible: showImgs.length!=0,
          onVisibleChange: (visible) => {setShowImgs([])},
          onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
        }}
      >
        {showImgs.map((url: string)=>{
          return <Image key={url} width={200} src={url} style={{height: 0}}/>
        })}
      </PreviewGroup>
      }
    </>
  );
}