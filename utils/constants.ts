export const xss_examples: any = [
  { label: 'Alert 测试', payload: '<script>alert("XSS")</script>' },
  { label: 'Console Log', payload: '<script>console.log("XSS")</script>' },
  { label: 'Image onerror', payload: '<img src=x onerror=alert("XSS") />' },
];
