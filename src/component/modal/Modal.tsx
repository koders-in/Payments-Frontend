import React, { useState } from "react";
import HyperLink from "../hyper-link/HyperLink";
import { Button, Checkbox, Typography, checkboxClasses } from "@mui/material";
import Spacer from "../spacer/Spacer";

interface Props {
  handleCheck: (data: any) => Promise<void>;
  handleClose: () => void;
}
const Modal = ({ handleCheck, handleClose }: Props) => {
  const [isDisable, setIsDisable] = useState(true);
  return (
    <div onClick={handleClose} className="dialog-modal">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-disp text-white dialog-child"
      >
        <Typography fontSize={18} marginRight="10px">
          Terms and Conditions{" "}
        </Typography>
        <Spacer height={30} />
        <div className="flex-disp justify-center">
          <Checkbox
            sx={{
              [`&, &.${checkboxClasses.checked}`]: {
                color: "rgba(0, 169, 157, 0.8)",
              },
              color: "pink",
            }}
            onChange={(e: any) => setIsDisable(!e.target.checked)}
          />
          <Typography flexWrap={"wrap"} marginRight="10px">
            <span>I agree to the</span>
            <HyperLink link="https://koders.in/terms-of-service" text="terms" />
            <span>,</span>
            <HyperLink link="https://koders.in/cancellation" text="refund" />
            <span>&nbsp;and</span>
            <HyperLink
              link="https://koders.in/cancellation"
              text="cancellation"
            />
            <span> policies.</span>
          </Typography>
        </div>
        <div className="modal-btns">
          <Button
            // fullWidth
            // disabled={!isDownloadFiles}
            onClick={handleClose}
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            // fullWidth
            disabled={isDisable}
            onClick={async () => {
              if (isDisable) return;
              setIsDisable(true);
              await handleCheck(true);
              handleClose();
            }}
            variant="contained"
          >
            Pay
          </Button>
          {/* <button onClick={handleClose}>Cancel</button>
          <button
            style={
              isDisable
                ? { cursor: "not-allowed", opacity: "0.8" }
                : { cursor: "pointer" }
            }
            onClick={async () => {
              if (isDisable) return;
              setIsDisable(true);
              await handleCheck(true);
              handleClose();
            }}
          >
            Pay
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Modal;