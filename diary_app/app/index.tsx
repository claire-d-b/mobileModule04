import Signin from "./signin";
import Home from "./home";
import Loading from "./loading";
import { useAuthContext } from "../context/AuthContext";

const _ = () => {
  const { localLogin, loading } = useAuthContext();

  return loading ? <Loading /> : localLogin ? <Home /> : <Signin />;
};

export default _;
