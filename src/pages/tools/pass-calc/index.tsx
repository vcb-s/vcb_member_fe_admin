import { useCallback, useState, memo, ChangeEvent } from 'react';
import { Form, Input, Typography } from 'antd';
import { useAsyncFn, useDebounce } from 'react-use';

const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 8 },
};
const tailLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 8, offset: 4 },
};

const PassCalc = memo(function PassCalc() {
  const [pass, setPass] = useState('');

  const [{ loading, error: errMsg, value: hash }, calc] =
    useAsyncFn(async () => {
      const { argon2id } = await import('hash-wasm');
      if (!pass) {
        return '';
      }
      const hash = await argon2id({
        password: pass,
        salt: '12345678',
        iterations: 1,
        parallelism: 1,
        memorySize: 8,
        hashLength: 32,
        outputType: 'encoded',
      });

      return hash;
    }, [pass]);

  const [isReady, cancel] = useDebounce(calc, 200, [pass]);

  const passChangeHandle = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setPass(evt.target.value);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>计算密码hash</Typography.Title>
      <Form>
        <Form.Item {...layout} label='密码'>
          <Input value={pass} onChange={passChangeHandle} />
        </Form.Item>
        <Form.Item
          {...layout}
          label='hash'
          validateStatus={
            errMsg
              ? 'error'
              : !!isReady() && !loading
              ? 'success'
              : 'validating'
          }
          hasFeedback
        >
          <Input value={hash} readOnly />
        </Form.Item>
        {/* <Form.Item {...tailLayout}>
          <Button onClick={() => copyToClipboard(hash || '')}>复制</Button>
        </Form.Item> */}
      </Form>
    </div>
  );
});

export default PassCalc;
