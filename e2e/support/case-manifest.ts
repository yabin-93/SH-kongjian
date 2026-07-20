export type CaseKind = 'normal' | 'abnormal' | 'boundary' | 'habit';

export interface P0Case {
  id: `P0-${string}`;
  module: 'login';
  kind: CaseKind;
  suite: 'smoke';
  title: string;
}

export const p0Cases: readonly P0Case[] = [
  { id: 'P0-LOGIN-001', module: 'login', kind: 'normal', suite: 'smoke', title: '正确登录' },
  { id: 'P0-LOGIN-002', module: 'login', kind: 'abnormal', suite: 'smoke', title: '错误密码' },
  { id: 'P0-LOGIN-003', module: 'login', kind: 'boundary', suite: 'smoke', title: '登录输入边界校验' },
  { id: 'P0-LOGIN-004', module: 'login', kind: 'habit', suite: 'smoke', title: '登录态失效后访问受保护页面' },
];
