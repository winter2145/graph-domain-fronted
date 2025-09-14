import { generateService } from '@umijs/openapi';

(async () => {
  try {
    await generateService({
      schemaPath: 'http://localhost:8080/api/v2/api-docs',
      serversPath: './src/generate',
      requestLibPath: "import request from '@/request'",
    });
    console.log('✅ 生成完成');
  } catch (e) {
    console.error('❌ 生成失败', e);
  }
})();