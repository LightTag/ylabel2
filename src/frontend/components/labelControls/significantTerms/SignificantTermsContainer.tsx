import React, { FunctionComponent } from "react";
import { useQuery } from "react-query";
import logger from "../../../../backend/utils/logger";
import SignificantTermsList from "./SignificantTermsList";
import { ILabelController } from "../../../../controllers/controllerInterfaces";

const SignificantTermsContainer: FunctionComponent<{
  label: string;
  labelController: ILabelController;
}> = (props) => {
  const query = useQuery(["sigTerms", props.label], () =>
    props.labelController.getSignificantTerms(props.label)
  );

  if (query.data === undefined) {
    return <div>"calculating"</div>;
  } else {
    logger({ label: props.label, terms: query.data.slice(10) });
  }
  return (
    <SignificantTermsList
      label={props.label}
      searchForTerm={props.labelController.searchForTerm}
      terms={query.data}
    />
  );
};

export default SignificantTermsContainer;
