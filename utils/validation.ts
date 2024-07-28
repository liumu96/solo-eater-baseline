// utils/validation.ts

// 校验函数，检查输入的链接是否是有效的 YouTube 链接
export const isValidYouTubeUrl = (url: string): boolean => {
  // YouTube 视频链接的正则表达式
  const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};
