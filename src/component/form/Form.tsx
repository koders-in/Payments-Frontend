import { Grid } from "@mui/material";
import Spacer from "../spacer/Spacer";
import Loader from "../loader/Loader";
import { showToaster } from "../../helper/toast";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ProjectDataComp from "../project-data/ProjectData";
import {
  mileStoneDataType,
  Project,
  ProjectData,
  useFormSubmitHook,
} from "../../hooks/form";
import {
  ICouponDetails,
  initialFormState,
  initialProjectState,
  initialToggleState,
  isValidResponse,
  SelectedOption,
  toggleBtnProps,
} from "./utils";
import CustomMenuItem from "./MenuItem";
import FormButton from "./FormButton";
import ProjectTitle from "./Title";
import FormInitialField from "./FormInitialField";
import { useDelayedQueryHook } from "../../hooks/delayed_query";
import { useGetBudgetFromIssues } from "../../hooks/issues_budget";
import { useApplyCouponHook } from "../../hooks/coupon";
import { FullScreenSpinner } from "..";

function Form() {
  const [projectDetails, setProjectDetails] =
    useState<ProjectData>(initialProjectState);
  const applyCouponCode = useApplyCouponHook();
  const isRead = useRef<boolean>(false);
  const getProject = useFormSubmitHook();
  const { debounceCallback } = useDelayedQueryHook();
  const [fullScreenLoader, setFullScreenLoader] = useState<boolean>(false);
  const [menuItemId, setMenuItemId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [couponDetails, setCouponDetails] = useState<ICouponDetails>({
    budgetAfterAppliedCoupon: "",
    originalBudget: "",
  });
  const [mileStone, setMileStone] = useState<Array<mileStoneDataType>>([]);
  const { getBudgetFromMilestones, payNow } = useGetBudgetFromIssues();
  const [
    {
      isSecretVisible,
      isDisableSelect,
      isDisableBtn,
      isBudgetFetch,
      isMilestoneFetch,
      isDisabledProject,
      isDisabledSecret,
      isValidRelease,
      isDownloadFiles,
      isCouponApplied,
    },
    setToggle,
  ] = useState<toggleBtnProps>(initialToggleState);
  const [isClickable, setIsClickable] = useState(false);
  const [{ apiKey, projectIdentifier, mileStoneId, couponCode }, setForm] =
    useState<Project>(initialFormState);
  const [selectedOption, setSelectedOption] = useState<SelectedOption>({
    isPaid: false,
    filesLink: "",
    demoLink: "",
  });

  // listener for reading URL and fetch project detaiuls and mapped to the UI
  // TODO:-> in future we can refactor this
  useEffect(() => {
    if (!isRead.current) {
      const fetchMileStones = async () => {
        const search = window.location.search;
        let params = new URLSearchParams(search);
        const api = params.get("api");
        const pid = params.get("pid");
        if (api && pid) {
          setFullScreenLoader(true);
          setForm((pre) => ({ ...pre, apiKey: api, projectIdentifier: pid }));
          const data = await getProject({
            apiKey: api,
            projectIdentifier: pid,
          });

          const handleFetchState = (value: boolean) => {
            setToggle((pre) => ({
              ...pre,
              isMilestoneFetch: value,
            }));
          };
          if (data === null || data.length === 0) {
            handleFetchState(false);
            showToaster("Network Error", "error");
            setFullScreenLoader(false);
            return;
          }
          if (isValidResponse(data)) {
            setToggle((pre) => ({
              ...pre,
              isDisableSelect: !pre.isDisableSelect,
              isDisabledProject: true,
              isDisabledSecret: true,
              isValidRelease: true,
            }));
            setProjectDetails({ ...data[0].projectData });
            const value: Array<mileStoneDataType> = Object.values(
              data[0].milestones
            );
            let tempArr: Array<mileStoneDataType> = [];
            value.forEach((item: mileStoneDataType, i) => {
              tempArr.push({ ...item, mileStoneId: i });
            });
            setMileStone([...tempArr]);
          } else {
            console.warn("????No milestones found in the response????");
          }
          setFullScreenLoader(false);
        }
      };
      fetchMileStones();
      isRead.current = true;
    }
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  /**
   * input field handlre for API key, project Id
   */
  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setForm((pre) => ({ ...pre, [name]: value }));
    if (name === "apiKey") {
      await debounceCallback(
        value,
        projectIdentifier,
        setToggle,
        setProjectDetails,
        setMileStone,
        setIsClickable
      );
    } else {
      if (apiKey?.length) {
        await debounceCallback(
          apiKey,
          projectIdentifier,
          setToggle,
          setProjectDetails,
          setMileStone,
          setIsClickable
        );
      }
    }
  };

  /**
   * toggle API key input field visibility
   */
  const handleSecretIcon = () => {
    setToggle((pre) => ({ ...pre, isSecretVisible: !pre.isSecretVisible }));
  };

  /**
   * handler to select milestone from milestoned array
   */
  const handleSelectChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setToggle((prev) => {
      return {
        ...prev,
        isDownloadFiles: false,
      };
    });
    setSelectedOption({ isPaid: false, filesLink: "", demoLink: "" });
    const { value } = e.target;
    setMenuItemId(value);
    setForm((pre) => ({ ...pre, mileStoneId: parseInt(value) }));
    setToggle((pre) => ({
      ...pre,
      isBudgetFetch: true,
    }));
    // fetching budget and save locally for future use
    const budget = await getBudgetFromMilestones(
      mileStone,
      value,
      apiKey,
      setSelectedOption,
      setToggle
    );

    if (typeof budget === "string") {
      setAmount(budget);
    }
  };

  /**
   * button handler to pay now functionality
   * without any coupon code
   */
  const handlePayNowHandler = async () => {
    await payNow(
      mileStone,
      mileStoneId,
      setToggle,
      apiKey,
      projectIdentifier,
      isCouponApplied ? couponDetails.budgetAfterAppliedCoupon : amount
    );
  };

  const handleProccessClick = async () => {
    setIsClickable(true);

    await debounceCallback(
      apiKey,
      projectIdentifier,
      setToggle,
      setProjectDetails,
      setMileStone,
      setIsClickable
    );
  };

  type ValueType = "files" | "videos";

  /**
   *  file download functionality
   * or demo video download
   */
  const handleDownloadBtn = (value: ValueType) => {
    if (selectedOption.filesLink === null || selectedOption.demoLink === null) {
      showToaster("Something is worng", "error");
      return;
    }
    if (value === "files") {
      window.open(`${selectedOption.filesLink}?key=${apiKey}`);
    } else {
      window.open(`${selectedOption.demoLink}?key=${apiKey}`);
    }
  };

  // coupon onChange handler
  const handleCouponChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((pre) => ({ ...pre, couponCode: e.target.value }));
  };

  // apply code btn handler
  const handleApplyCoupon = async () => {
    if (couponCode !== undefined && couponCode.length > 0) {
      setToggle((pre) => {
        return { ...pre, isDisableBtn: true };
      });

      if (isCouponApplied) {
        const amount = await getBudgetFromMilestones(
          mileStone,
          menuItemId,
          apiKey,
          setSelectedOption,
          setToggle
        );
        if (amount) {
          // reset value on code remove clicked
          setToggle((pre) => {
            return { ...pre, isCouponApplied: false };
          });
          setForm((pre) => ({ ...pre, couponCode: "" }));
          setCouponDetails({
            budgetAfterAppliedCoupon: "",
            originalBudget: "",
          });
          setAmount(amount);
        }
      } else {
        const amount = await applyCouponCode(
          mileStone,
          menuItemId,
          setSelectedOption,
          apiKey,
          couponCode,
          projectIdentifier
        );
        if (amount) {
          setToggle((pre) => {
            return { ...pre, isCouponApplied: true };
          });
          setCouponDetails(amount);
        }
      }
      setToggle((pre) => {
        return { ...pre, isDisableBtn: false };
      });
    } else showToaster("Enter valid coupon code", "error");
  };

  return (
    <Grid justifyContent="center" container>
      <Grid sm={6} xs={12} lg={5} item>
        {!isValidRelease ? (
          <>
            <ProjectTitle />
            <Spacer isWidth={true} height={20} width="100%" />
            <FormInitialField
              apiKey={apiKey}
              handleInputChange={handleInputChange}
              handleSecretIcon={handleSecretIcon}
              isDisabledProject={isDisabledProject}
              isDisabledSecret={isDisabledSecret}
              isSecretVisible={isSecretVisible}
              projectIdentifier={projectIdentifier}
            />
          </>
        ) : (
          <ProjectDataComp {...projectDetails} />
        )}
        <CustomMenuItem
          handleSelectChange={handleSelectChange}
          isDisableSelect={isDisableSelect}
          mileStone={mileStone}
          mileStoneId={mileStoneId}
        />
        <Loader isLoading={isMilestoneFetch} type="loader" />
        <Spacer isWidth={true} height={15} width="100%" />
        <FormButton
          selectedOption={selectedOption}
          amount={amount}
          isCouponApplied={isCouponApplied}
          onCodeApply={handleApplyCoupon}
          handlePayNow={handlePayNowHandler}
          onCodeChange={handleCouponChange}
          isBudgetFetch={isBudgetFetch}
          couponDetails={couponDetails}
          isClickable={isClickable}
          isDisableBtn={isDisableBtn}
          isDownloadFiles={isDownloadFiles}
          onProceedClick={handleProccessClick}
          handleDownloadFiles={() => handleDownloadBtn("files")}
          handleDownloadVideo={() => handleDownloadBtn("videos")}
        />
      </Grid>
      {fullScreenLoader ? <FullScreenSpinner /> : null}
    </Grid>
  );
}

export default Form;
