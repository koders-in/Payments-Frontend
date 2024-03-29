import React from "react";
import {
  Description,
  Heading,
  ProjectDetailForm,
  Spacer,
} from "../../component";

interface Props {
  showInvoice: {
    projectIdentifier: string;
    isLoggedIn: boolean;
    apiKey: string;
  };
  setShowInvoice: (data: {
    projectIdentifier: string;
    apiKey: string;
    isLoggedIn: boolean;
  }) => void;
}
function Home({ showInvoice, setShowInvoice }: Props) {
  return (
    <div className="home">
      <Heading />
      <Description />
      <Spacer height={50} />
      <ProjectDetailForm {...{ showInvoice, setShowInvoice }} />
    </div>
  );
}

export default Home;
