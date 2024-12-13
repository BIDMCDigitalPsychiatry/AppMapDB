import { useTableFilterValues } from '../application/GenericTable/store';

export const useFilterCount = (table = 'Applications') => {
  const [
    {
      Features = [],
      Engagements = [],
      Inputs = [],
      Outputs = [],
      Functionalities = [],
      Conditions = [],
      Platforms = [],
      Cost = [],
      Privacy = [],
      Uses = [],
      DeveloperTypes = [],
      ClinicalFoundations = [],
      TreatmentApproaches = []
    }
  ] = useTableFilterValues(table);

  return [
    TreatmentApproaches,
    Features,
    Engagements,
    Inputs,
    Outputs,
    Functionalities,
    Conditions,
    Platforms,
    Cost,
    Privacy,
    Uses,
    DeveloperTypes,
    ClinicalFoundations
  ].reduce((t, c) => (t = t + c.length), 0);
};
