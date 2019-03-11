import * as React from 'react';
import { Mention } from 'antd';

import Layout from 'components/global/layout';
import './home.scss';

export const Home = () => (
  <Layout title="Dashbord" description="This is the home page">
    <p className="home-page">This is is the home page</p>
    <Mention
      style={{ width: '100%', height: 100 }}
      defaultSuggestions={['afc163', 'benjycui', 'yiminghe', 'jljsj33', 'dqaria', 'RaoHai']}
      multiLines
    />
  </Layout>
);

export default Home;
