import { Layout, Menu } from 'antd';
import { useAuth } from 'context/AuthContext';
import React, { useState } from 'react';

import { MenuItem, SidebarProps } from '@utils/types';

import styles from '../../styles/components/Sidebar.module.scss';
import { itemsMap } from './data';
import { APP_ORG } from 'constants/main';

const { Header, Content, Footer, Sider } = Layout;

const Sidebar: React.FC<SidebarProps> = ({ children, sidebarKey }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const org = user?.data?.org || '';
  const role = user?.data?.role || '';

  let items: MenuItem[] = [];
  if (org && role) {
    if (org == APP_ORG) {
      items = itemsMap[`${APP_ORG}_${role}`];
    } else {
      items = itemsMap[`${org}`];
    }
  }

  return (
    <Layout className={styles.layout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className={styles.sidebarDiv}></div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[sidebarKey]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>Orion</Header>
        <Content className={styles.content}>{children}</Content>
        <Footer className={styles.footer}>
          Orion ©2023 Created by Karel Renaldi S
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
