import { NextPage } from 'next';

const Pageindex: NextPage = () => {
  return null;
};

export async function getServerSideProps() {
  return {
    redirect: {
      permanent: false,
      destination: '/login',
    },
  };
}

export default Pageindex;
