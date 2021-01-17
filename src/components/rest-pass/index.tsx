import {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useMemo,
  MouseEvent,
  useEffect,
  useReducer,
} from 'react';
import { usePrevious } from 'react-use';
import { Modal, Form, Input } from 'antd';
import { produce } from 'immer';
import { ModalProps } from 'antd/lib/modal';
import { useDispatch } from 'umi';

import { PersonModel } from '@/models/person';

const restPassInital = {
  show: false,
  pass: '',
};
const restPassReducer = (
  state: typeof restPassInital,
  action: { type: string; payload?: string },
) => {
  return produce(state, (state) => {
    switch (action.type) {
      case 'open': {
        state.show = true;
        break;
      }
      case 'close': {
        state.show = false;
        break;
      }

      case 'change': {
        state.pass = action.payload || '';
        break;
      }

      case 'reset': {
        return restPassInital;
      }

      default: {
        break;
      }
    }
  });
};
const useRestPass = () => {
  const [state, dispatch] = useReducer(restPassReducer, restPassInital);
  return useMemo(() => {
    return {
      state,
      open: () => dispatch({ type: 'open' }),
      close: (evt?: MouseEvent) => {
        // 这里需要保留这一行代码
        // 目前尚不清楚原理，但是如果在 Dropdown -> Menu -> MenuItem -> Modal 这样的组件树里边，Modal即使默认就设置为渲染在body
        // 弹层的Mouse事件仍然会冒泡到 Menu 的 onChange；后果就是无法关闭弹层（因为同时会因为 onChange 的缘故打开弹层
        evt?.stopPropagation();
        dispatch({ type: 'close' });
      },
      change: (pass: string) => dispatch({ type: 'change', payload: pass }),
      reset: () => dispatch({ type: 'reset' }),
    };
  }, [state]);
};

export interface RestPassProps {
  uid?: string;
  show: boolean;
  onClose: (uid?: string) => void;
}
export const RestPass: FC<RestPassProps> = memo(function RestPass({
  children,
  uid,
  show,
  onClose,
}) {
  const dispatch = useDispatch();
  const prevShow = usePrevious(show);
  const submitLoading = PersonModel.hooks.useLoading('restPass');
  const okButtonProps = useMemo((): ModalProps['okButtonProps'] => {
    return { loading: submitLoading };
  }, [submitLoading]);

  const { state, open, close, reset, change } = useRestPass();

  const changeHandle = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      change(evt.target.value);
    },
    [change],
  );

  const submitHandle = useCallback(() => {
    PersonModel.dispatch.restPass(dispatch, {
      pass: state.pass,
      uid,
      cb: () => close(),
    });
  }, [close, dispatch, state.pass, uid]);

  const afterCloseHandle = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!prevShow && show) {
      open();
    }
  }, [open, prevShow, show]);

  return (
    <>
      {children}

      <Modal
        visible={state.show}
        onCancel={close}
        onOk={submitHandle}
        okButtonProps={okButtonProps}
        afterClose={afterCloseHandle}
        centered
        title='重置登录密码'
      >
        <Form>
          <Form.Item label='新密码' help='重置成功后注意保存新密码'>
            <Input
              placeholder='留空则重置为系统生成的4位数字随机密码'
              value={state.pass}
              onChange={changeHandle}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
