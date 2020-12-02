import React, { FunctionComponent } from "react";
import { useQuery } from "react-query";
import logger from "../../../../backend/utils/logger";
import SignificantTermsList from "./SignificantTermsList";
import { ILabelController } from "../../../../controllers/controllerInterfaces";

const SignificantTermsContainer: FunctionComponent<{
  label: string;
  labelController: ILabelController;
  count: number;
}> = (props) => {
  const query = useQuery(
    ["sigTerms", props.label],
    () => props.labelController.getSignificantTerms(props.label),
    { cacheTime: 0 }
  );

  if (query.isLoading === undefined) {
    return <div>"calculating"</div>;
  }
  if (query.isError) {
    return <div> error</div>;
  }
  if (!query.data) {
    return <div> problem {JSON.stringify(query.isSuccess)}</div>;
  } else {
    logger({ label: props.label, terms: query.data.terms.slice(10) });
  }
  return (
    <SignificantTermsList
      label={props.label}
      searchForTerm={props.labelController.searchForTerm}
      terms={query.data.terms}
    />
  );
};

export default SignificantTermsContainer;
