import Signin from "./signin";
import Home from "./home";
import CLoading from "./CLoading";
import { useAuthContext } from "../context/AuthContext";

const _ = () => {
  const { localLogin, loading } = useAuthContext();

  return loading ? <CLoading /> : localLogin ? <Home /> : <Signin />;
};

export default _;
