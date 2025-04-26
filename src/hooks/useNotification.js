import { notification } from 'antd';

const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const notify = (type, message, description, placement = 'topRight') => {
    api[type]({
      message,
      description,
      placement,
    });
  };

  return {
    notify,
    contextHolder,
  };
};

export default useNotification;