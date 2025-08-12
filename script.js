$(document).ready(function () {
     $("#fareAdult, #fareChild, #fareInfant").focus(function() {
      if ($(this).val() === "0") {
        $(this).val("");
      }
    });

    $("#fareAdult, #fareChild, #fareInfant").blur(function() {
      if ($(this).val().trim() === "") {
        $(this).val("0");
      }
    });
    $("#calc").click(function () {
        // Separate fares for each type
    
        let fareAdult = parseFloat($("#fareAdult").val()) || 0;
        let fareChild = parseFloat($("#fareChild").val()) || 0;
        let fareInfant = parseFloat($("#fareInfant").val()) || 0;

        let adults = parseInt($("#adults").val()) || 0;
        let children = parseInt($("#children").val()) || 0;
        let infants = parseInt($("#infants").val()) || 0;

                if (infants > adults) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Infant count should not exceed Adult count.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return; // Stop execution after showing alert
        }


   if (adults < 1) {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: 'You need to select at least one adult to continue.',
    width: '340px',
    customClass: {
      popup: 'small-swal-popup'
    }
  });
  return;  // STOP further execution
}

        if (adults > 0 && fareAdult <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a valid fare for Adult passengers.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }
        if (children > 0 && fareChild <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a valid fare for Child passengers.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }
        if (infants > 0 && fareInfant <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter a valid fare for Infant passengers.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }

        let tripType = $("#tripType").val().toLowerCase();
        let travelClass = $("#travelClass").val().toLowerCase();
        let ticketType = $("input[name='ticketType']:checked").val();

            if (!ticketType) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please select a trip purpose before calculating.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }


        let totalPax = adults + children + infants;
        let totalFare = (fareAdult * adults) + (fareChild * children) + (fareInfant * infants);

        if (ticketType === "monthly+discounted" && totalPax < 2) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Monthly + Discount ticket requires at least 2 passengers.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }

        let result = {
            CCTotalCharges: 0,
            PCTotalCharges: 0,
            CCAdultAmount: 0,
            PCAdultAmount: 0,
            CCChildAmount: 0,
            PCChildAmount: 0,
            CCInfantAmount: 0,
            PCInfantAmount: 0
        };

                if ((fareAdult < 0) || (fareChild < 0) || (fareInfant < 0)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter valid fare amounts.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }

        // Monthly: only 1 pax allowed
        if (ticketType === "monthly" && totalPax > 1) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Monthly ticket is allowed for only 1 passenger.',
            width: '340px',
            customClass: {
            popup: 'small-swal-popup'
            }
        });
        return;
        }


        // Helper function for rounding to 2 decimals
        function round2(n) {
            return Math.round(n * 100) / 100;
        }

        // Monthly ticket logic
        if (ticketType === "monthly") {
            let personalDeduction = 0;

            if (travelClass === "economy") {
                personalDeduction = 0; // Full corporate
            } else if (travelClass === "business") {
                personalDeduction = (tripType === "oneway") ? 400 : 800;
            }

            let actualDeduction = Math.min(personalDeduction, totalFare);

            result.CCTotalCharges = round2(totalFare - actualDeduction);
            result.PCTotalCharges = round2(actualDeduction);

            // Assuming monthly ticket applies only to 1 adult
            result.CCAdultAmount = round2(totalFare - actualDeduction);
            result.PCAdultAmount = round2(actualDeduction);

        }
        // Discounted ticket logic
        else if (ticketType === "discounted") {
            let personalDeduction = 0;

            if (travelClass === "economy") {
                personalDeduction = (tripType === "oneway") ? 400 : 800;
            } else if (travelClass === "business") {
                personalDeduction = (tripType === "oneway") ? 800 : 1600;
            }

            // Helper function for split
            function splitFare(fare, count) {
                if (count > 0 && fare > 0) {
                    const pc = Math.min(personalDeduction, fare);
                    const cc = Math.max(fare - personalDeduction, 0);
                    return { pc, cc };
                } else {
                    return { pc: 0, cc: 0 };
                }
            }

            // Adults
            const adultSplit = splitFare(fareAdult, adults);
            result.PCAdultAmount = round2(adultSplit.pc);
            result.CCAdultAmount = round2(adultSplit.cc);

            // Children
            const childSplit = splitFare(fareChild, children);
            result.PCChildAmount = round2(childSplit.pc);
            result.CCChildAmount = round2(childSplit.cc);

            // Infants
            const infantSplit = splitFare(fareInfant, infants);
            result.PCInfantAmount = round2(infantSplit.pc);
            result.CCInfantAmount = round2(infantSplit.cc);

            // Totals
            result.PCTotalCharges = round2(
                (result.PCAdultAmount * adults) +
                (result.PCChildAmount * children) +
                (result.PCInfantAmount * infants)
            );

            result.CCTotalCharges = round2(
                (result.CCAdultAmount * adults) +
                (result.CCChildAmount * children) +
                (result.CCInfantAmount * infants)
            );
        }
        // Monthly + Discounted ticket logic
        else if (ticketType === "monthly+discounted") {
            let personalDeductionMonthly = 0;
            let personalDeductionDiscounted = 0;

            if (travelClass === "economy") {
                personalDeductionMonthly = 0; // monthly economy full from corporate card
                personalDeductionDiscounted = (tripType === "oneway") ? 400 : 800;
            } else if (travelClass === "business") {
                personalDeductionMonthly = (tripType === "oneway") ? 400 : 800;
                personalDeductionDiscounted = (tripType === "oneway") ? 800 : 1600;
            }

            // Create passengers array: adults first (lead monthly), then children, then infants
            let passengers = [];

            for (let i = 0; i < adults; i++) {
                passengers.push({
                    type: "Adult",
                    fare: fareAdult,
                    tripType,
                    cabinClass: travelClass
                });
            }
            for (let i = 0; i < children; i++) {
                passengers.push({
                    type: "Child",
                    fare: fareChild,
                    tripType,
                    cabinClass: travelClass
                });
            }
            for (let i = 0; i < infants; i++) {
                passengers.push({
                    type: "Infant",
                    fare: fareInfant,
                    tripType,
                    cabinClass: travelClass
                });
            }

            let PCAdultAmount = 0, CCAdultAmount = 0;
            let PCChildAmount = 0, CCChildAmount = 0;
            let PCInfantAmount = 0, CCInfantAmount = 0;
            let PCTotalCharges = 0, CCTotalCharges = 0;

passengers.forEach((pax, index) => {
    let fare = pax.fare || 0;
    let pcDeduction = 0;
    let pcAmount = 0;
    let ccAmount = 0;

    if (index === 0) {
        // Lead passenger - monthly logic
        pcDeduction = personalDeductionMonthly;
        pcAmount = Math.min(pcDeduction, fare);
    } else {
        // Other passengers - discounted logic
        pcDeduction = personalDeductionDiscounted;
        pcAmount = Math.min(pcDeduction, fare);
    }

    ccAmount = Math.max(fare - pcAmount, 0);

    PCTotalCharges += pcAmount;
    CCTotalCharges += ccAmount;

    if (index !== 0) { // discounted passengers only for category per-pax amount
        if (pax.type === "Adult") {
            // overwrite per pax amount with current passenger's split
            PCAdultAmount = pcAmount;
            CCAdultAmount = ccAmount;
        } else if (pax.type === "Child") {
            PCChildAmount = pcAmount;
            CCChildAmount = ccAmount;
        } else if (pax.type === "Infant") {
            PCInfantAmount = pcAmount;
            CCInfantAmount = ccAmount;
        }
    }
});


            // Round all amounts
            PCAdultAmount = round2(PCAdultAmount);
            CCAdultAmount = round2(CCAdultAmount);
            PCChildAmount = round2(PCChildAmount);
            CCChildAmount = round2(CCChildAmount);
            PCInfantAmount = round2(PCInfantAmount);
            CCInfantAmount = round2(CCInfantAmount);
            PCTotalCharges = round2(PCTotalCharges);
            CCTotalCharges = round2(CCTotalCharges);

            result.PCAdultAmount = PCAdultAmount;
            result.CCAdultAmount = CCAdultAmount;
            result.PCChildAmount = PCChildAmount;
            result.CCChildAmount = CCChildAmount;
            result.PCInfantAmount = PCInfantAmount;
            result.CCInfantAmount = CCInfantAmount;
            result.PCTotalCharges = PCTotalCharges;
            result.CCTotalCharges = CCTotalCharges;
        }

        
        // Final safeguard rounding (optional)
        for (let key in result) {
            if (typeof result[key] === "number") {
                result[key] = parseFloat(result[key].toFixed(2));
            }
        }

let resultText = Object.entries(result)
    .map(([key, value]) => `"${key}": ${value}`)
    .join(",\n");

$("#result").text(resultText).show();
        // Show/hide copy button based on content
        if ($("#result").text().trim() !== "") {
            $("#copyBtn").show();
        } else {
            $("#copyBtn").hide();
        }
    });
  $("#copyBtn").click(function () {
    let text = $("#result").text().trim();
    if (!text) return;

    let btn = $(this);
    navigator.clipboard.writeText(text).then(() => {
        btn.html('<img src="icons8-tick.gif" alt="Copied" style="width:16px; height:16px;">');

        setTimeout(() => {
            // Revert back to the interface.png copy icon
            btn.html('<img src="interface.png" alt="Copy" style="width:16px; height:16px;">');
        }, 1750);
    });
});
$("#result").hide();

        resetFormFields();
});
function resetFormFields() {
    $("#fareAdult").val("0");
    $("#fareChild").val("0");
    $("#fareInfant").val("0");

    $("#adults").val("1");
    $("#children").val("0");
    $("#infants").val("0");

    $("#tripType").val("oneway");
    $("#travelClass").val("economy");
    $("input[name='ticketType']").prop("checked", false);

    $("#result").text("");
    $("#copyBtn").hide(); // ensure copy button hidden on load/reset
}