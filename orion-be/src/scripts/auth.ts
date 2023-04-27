import { org1, org2, org3 } from '@src/constants/constant';
import { enrollAdmin, enrollNewAdmin, enrollNewUser } from '@src/utils/fabric';

const registerAndEnrollAdmin = async () => {
  await Promise.all([enrollAdmin(org1), enrollAdmin(org2), enrollAdmin(org3)]);
  await Promise.all([enrollNewAdmin(org1), enrollNewAdmin(org2), enrollNewAdmin(org3)]);
  await Promise.all([
    enrollNewUser('3204091010901234', org1),
    enrollNewUser('5403014210135678', org1),
    enrollNewUser('3401041108912345', org1),
    enrollNewUser('1107022505021234', org1),
    enrollNewUser('kapolda_bandung', org2),
    enrollNewUser('kapolda_jakarta', org2),
    enrollNewUser('bengkel_bandung', org3),
    enrollNewUser('bengkel_jakarta', org3),
  ]);
};

export default registerAndEnrollAdmin;
