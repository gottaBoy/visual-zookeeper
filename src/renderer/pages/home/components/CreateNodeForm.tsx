import { Form, Input, Modal } from "antd";
import React from "react";
import { FormComponentProps } from "antd/es/form";
import { ModalProps } from "antd/es/modal";
import TextArea from "antd/lib/input/TextArea";

const { Item } = Form;

export interface CreateNodeFormProps extends FormComponentProps {
  visible: boolean;
  parentNode: string;
  onCancel: ModalProps["onCancel"];
  onCreate: (values: any) => void;
}

const CreateNodeForm: React.ComponentType<CreateNodeFormProps> = props => {
  const { visible, parentNode, onCancel, onCreate, form } = props;
  const { getFieldDecorator } = form;
  const onOk = () => {
    form.validateFields((err: any, values: any) => {
      if (err) return;
      onCreate(values);
    });
  };
  return (
    <Modal
      destroyOnClose
      title={"添加节点"}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Form>
        <Item label="父节点">{parentNode}</Item>
        <Item label="节点名">
          {getFieldDecorator("zkNodeName", {
            rules: [{ required: true, message: "请输入节点名称" }]
          })(<Input placeholder={"请输入节点名称"} />)}
        </Item>
        <Item label="节点值">
          {getFieldDecorator("nodeData")(
            <TextArea placeholder={"请输入节点值"} />
          )}
        </Item>
      </Form>
    </Modal>
  );
};

export default Form.create<CreateNodeFormProps>()(CreateNodeForm);
