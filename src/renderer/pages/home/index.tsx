import React, { useEffect, useState } from "react";
import { connect } from "dva";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Row,
  Select,
  Switch,
  Table,
  Tabs,
  Tree
} from "antd";
import { AnyAction, Dispatch } from "redux";
import { StateType } from "@/pages/home/model";
import { TreeProps } from "antd/es/tree";
import { TreeNodeNormal } from "antd/es/tree/Tree";
import style from "./style.less";
import SplitPane from "react-split-pane";
import { ZkACL } from "@/utils/zk-client";

interface HomeProps {
  home: StateType;
  dispatch: Dispatch<AnyAction>;
  loading: boolean;
}

const { TreeNode, DirectoryTree } = Tree;
const { Search, TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

function Home(props: HomeProps) {
  const { dispatch, home } = props;
  const [treeData, setTreeData] = useState<TreeNodeNormal[]>([]);
  const [nodePath, setNodePath] = useState<string>("");
  const [nodeName, setNodeName] = useState<string>("");
  const [nodeData, setNodeData] = useState<string>("");
  const [nodeACL, setNodeACL] = useState<ZkACL>(new ZkACL("", "", ""));

  useEffect(() => {
    dispatch({
      type: "home/connect",
      payload: { connectionString: "118.25.172.148:2181" }, //118.25.172.148:2181
      callback() {
        dispatch({
          type: "home/getChildren",
          payload: { path: "/" },
          callback(data: string[]) {
            let treeData: TreeNodeNormal[] = data.map(item => {
              return { title: item, key: `/${item}` };
            });
            setTreeData(treeData);
          }
        });
      }
    });
  }, []);

  const onLoadData: TreeProps["loadData"] = node =>
    new Promise(resolve => {
      let path = node.props.eventKey;
      if (node.props.children) {
        resolve();
        return;
      }
      dispatch({
        type: "home/getChildren",
        payload: { path },
        callback(data: string[]) {
          node.props.dataRef.children = data.map(item => {
            return {
              title: item,
              key: `${path}/${item}`
            };
          });
          setTreeData(treeData);
          resolve();
        }
      });
    });

  const renderTreeNodes = (data: TreeNodeNormal[]) =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} dataRef={item} />;
    });

  const onClickTree: TreeProps["onClick"] = (e, node) => {
    setNodeName(node.props.title as string);
    const path = node.props.eventKey as string;
    setNodePath(path);
    dispatch({
      type: "home/getData",
      payload: { path },
      callback(nodeData: string) {
        setNodeData(nodeData);
      }
    });
    dispatch({
      type: "home/getACL",
      payload: { path },
      callback(nodeACL: ZkACL) {
        setNodeACL(nodeACL);
      }
    });
  };

  const onSetData = () => {
    dispatch({
      type: "home/setData",
      payload: { path: nodePath, data: nodeData },
      callback() {
        message.success(`${nodePath}节点值更新成功`);
      }
    });
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "值",
      dataIndex: "value",
      key: "value"
    },
    {
      title: "真实值",
      dataIndex: "realValue",
      key: "realValue"
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description"
    }
  ];

  const leftDiv = (
    <div>
      <Card style={{ overflow: "auto", height: "98.5vh", margin: 5 }} hoverable>
        <Search
          placeholder="请输入节点"
          onSearch={value => console.log(value)}
        />
        <DirectoryTree loadData={onLoadData} onClick={onClickTree}>
          {renderTreeNodes(treeData)}
        </DirectoryTree>
      </Card>
    </div>
  );

  return (
    <>
      <SplitPane
        split={"vertical"}
        minSize={300}
        defaultSize={parseInt(localStorage.getItem("splitPos") as string)}
        onChange={size => localStorage.setItem("splitPos", size.toString())}
      >
        {leftDiv}
        <div>
          <Card style={{ height: "68vh", margin: 5 }} hoverable>
            <Tabs>
              <TabPane tab="节点名" key="1">
                <Card className={style.tabsCard}>{nodeName}</Card>
                <Row align={"middle"} justify={"center"}>
                  <Col>
                    <div style={{ margin: 5, height: "10vh" }}>
                      URL解码：
                      <Switch
                        onChange={(checked: boolean) => {
                          if (checked) {
                            setNodeName(decodeURIComponent(nodeName));
                          } else {
                            setNodeName(encodeURIComponent(nodeName));
                          }
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="节点值" key="2">
                <Card className={style.tabsCard}>
                  <TextArea
                    rows={4}
                    value={nodeData}
                    autosize={{ minRows: 18, maxRows: 18 }}
                    onChange={event => setNodeData(event.target.value)}
                  />
                </Card>
                <Row align={"middle"} justify={"center"}>
                  <Col>
                    <div style={{ margin: 5, height: "10vh" }}>
                      <Button type="primary" onClick={onSetData}>
                        保存
                      </Button>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="节点属性" key="3">
                <Table
                  columns={columns}
                  dataSource={home.nodeStat}
                  rowKey={"name"}
                  size={"small"}
                  pagination={false}
                  scroll={{ y: "47vh" }}
                />
              </TabPane>
              <TabPane tab="节点权限" key="4">
                <Card className={style.tabsCard}>
                  <Descriptions
                    bordered
                    size={"small"}
                    layout={"horizontal"}
                    column={1}
                  >
                    <Descriptions.Item label="Schema(权限模式)" span={2}>
                      {nodeACL.scheme}
                      {/*<Select*/}
                      {/*  defaultValue="lucy"*/}
                      {/*  style={{ width: 200 }}*/}
                      {/*  onChange={(value: string) => {*/}
                      {/*    nodeAcl.id.scheme = value;*/}
                      {/*    setNodeAcl(nodeAcl);*/}
                      {/*  }}*/}
                      {/*  value={nodeAcl.id.scheme}*/}
                      {/*>*/}
                      {/*  <Option value="world">world</Option>*/}
                      {/*  <Option value="auth">auth</Option>*/}
                      {/*  <Option value="digest">digest</Option>*/}
                      {/*  <Option value="ip">ip</Option>*/}
                      {/*</Select>*/}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID(授权对象)">
                      {nodeACL.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Permission(权限)" span={2}>
                      {nodeACL.permissions}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </TabPane>
            </Tabs>
          </Card>
          <Card style={{ height: "30vh", margin: 5 }}>功能待定</Card>
        </div>
      </SplitPane>
    </>
  );
}

const mapStateToProps = ({
  home,
  loading
}: {
  home: StateType;
  loading: { models: { [key: string]: boolean } };
}) => ({
  home,
  loading: loading.models.home
});

export default connect(mapStateToProps)(Home);
