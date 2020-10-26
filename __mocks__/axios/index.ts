const axios = jest.fn().mockResolvedValue({ status: 200, data: {} });

// @ts-ignore
axios.CancelToken = { source: () => ({ cancel: jest.fn(), token: {} }) };

export default axios;
