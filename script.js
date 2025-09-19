$(document).ready(function () {
    let lastCalculatedState = null;
    let calculationHistory = [];
    const MAX_HISTORY = 4;

      $('input[type=number]').on('wheel', function(e) {
      e.preventDefault();
    });
	
	// // Helper function for rounding to 2 decimals
    // function round2(n) {
    //     return Math.round(n * 100) / 100;
    // }

   function calculateSandboxAmount(pcTotalCharges) {
    const surcharge = pcTotalCharges * 2.5 / 100;
    const percentageOfSurcharge = surcharge * 0.15;
    const totalAmount = pcTotalCharges + surcharge + percentageOfSurcharge;

    // Convert to integer minor unit (e.g., cents)
    return Math.round(totalAmount * 100);
}


    // Simulate persistent storage (in a real environment, you'd use localStorage)
    function saveHistory() {
        // In a real browser environment, you would use:
        localStorage.setItem('fareCalculatorHistory', JSON.stringify(calculationHistory));
        console.log('History saved:', calculationHistory);
    }

    function loadHistory() {
        const saved = localStorage.getItem('fareCalculatorHistory');
        if (saved) {
            calculationHistory = JSON.parse(saved);
        }
        updateHistoryDisplay();
    }

    function addToHistory(inputs, result) {
        const historyItem = {
            timestamp: new Date().toLocaleString(),
            inputs: { ...inputs },
            result: { ...result }
        };

        // Add to beginning of array
        calculationHistory.unshift(historyItem);

        // Keep only the latest MAX_HISTORY items
        if (calculationHistory.length > MAX_HISTORY) {
            calculationHistory = calculationHistory.slice(0, MAX_HISTORY);
        }

        saveHistory();
        updateHistoryDisplay();
    }

   // Updated updateHistoryDisplay function with bold trip purpose and corrected naming
function updateHistoryDisplay() {
    const historyContainer = $('#historyContainer');
    const historySection = $('#historySection');

    if (calculationHistory.length === 0) {
        historyContainer.html('<div class="no-history">No calculations yet</div>');
        historySection.hide();
        return;
    }

    historySection.show();
    let historyHtml = '';

    calculationHistory.forEach((item, index) => {
        const inputs = item.inputs;
        const result = item.result;
        const totalPax = parseInt(inputs.adults) + parseInt(inputs.children) + parseInt(inputs.infants);
        
        // Format ticket type with corrected naming and make it bold
        let ticketTypeDisplay = inputs.ticketType;
        if (ticketTypeDisplay === 'monthly+discounted') {
            ticketTypeDisplay = 'monthly+discount';
        }
        ticketTypeDisplay = ticketTypeDisplay.replace('+', ' + ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Format trip type and cabin class for the header
        const tripTypeDisplay = inputs.tripType.charAt(0).toUpperCase() + inputs.tripType.slice(1);
        const cabinClassDisplay = inputs.travelClass.charAt(0).toUpperCase() + inputs.travelClass.slice(1);
const paymentMethodDisplay = inputs.paymentMethod === 'other' ? 'Gateway' : 
            inputs.paymentMethod.charAt(0).toUpperCase() + inputs.paymentMethod.slice(1); 
                   
        historyHtml += `
            <div class="history-item" data-index="${index}">
                <div class="history-item-header">
                    <span class="history-item-title">#${index + 1} • ${totalPax} pax • <strong>${ticketTypeDisplay}</strong> | ${tripTypeDisplay} | ${cabinClassDisplay} | ${paymentMethodDisplay}</span>
                    <button class="history-copy-btn" data-index="${index}" title="Copy result">
             <img class="copy-icon" src="interface.png" alt="Copy" style="width:16px; height:16px; cursor:pointer;">
             <img class="check-icon" src="icons8-tick.gif" style="width:16px; height:16px; cursor:pointer;">
                    </button>
                </div>
                <div class="history-details">
                    <div>Adults: ${inputs.adults} (SAR ${inputs.fareAdult})</div>
                    <div>Children: ${inputs.children} (SAR ${inputs.fareChild})</div>
                    <div>Infants: ${inputs.infants} (SAR ${inputs.fareInfant})</div>
                    <div></div>
                </div>
                <div class="history-totals">
                    <div class="history-totals-left">Corporate Card: SAR ${result.CCTotalCharges} • Personal Card: SAR ${result.PCTotalCharges}</div>
                    <div class="history-timestamp">${item.timestamp}</div>
                </div>
            </div>
        `;
    });

    historyContainer.html(historyHtml);
}

    // History copy button click handler
    $(document).on('click', '.history-copy-btn', function(e) {
        e.stopPropagation(); // Prevent triggering the history item click
        
        const index = $(this).data('index');
        const historyItem = calculationHistory[index];
        
        if (historyItem) {
            const result = historyItem.result;
            
            // Format the result as requested
            let resultText = Object.entries(result)
                .map(([key, value]) => `"${key}": ${value}`)
                .join(",\n");
            
            const btn = $(this);
            
            navigator.clipboard.writeText(resultText).then(() => {
                // Add 'copied' class to trigger CSS animation
                btn.addClass('copied');
                
                // Remove 'copied' class after 1.5 seconds to restore original state
                setTimeout(() => {
                    btn.removeClass('copied');
                }, 1500);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = resultText;
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    // Add 'copied' class to trigger CSS animation
                    btn.addClass('copied');
                    
                    // Remove 'copied' class after 1.5 seconds
                    setTimeout(() => {
                        btn.removeClass('copied');
                    }, 1500);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
                
                document.body.removeChild(textArea);
            });
        }
    });

    // History item click handler (updated to avoid copy button area)
    $(document).on('click', '.history-item', function(e) {
        // Don't trigger if clicking the copy button
        if ($(e.target).closest('.history-copy-btn').length) {
            return;
        }
        
        const index = $(this).data('index');
        const historyItem = calculationHistory[index];
        
        if (historyItem) {
            const inputs = historyItem.inputs;
            
            // Populate form with historical data
            $('#fareAdult').val(inputs.fareAdult);
            $('#fareChild').val(inputs.fareChild);
            $('#fareInfant').val(inputs.fareInfant);
            $('#adults').val(inputs.adults);
            $('#children').val(inputs.children);
            $('#infants').val(inputs.infants);
            $('#tripType').val(inputs.tripType);
            $('#travelClass').val(inputs.travelClass);
            $(`input[name='ticketType'][value='${inputs.ticketType}']`).prop('checked', true);
            $(`input[name='paymentMethod'][value='${inputs.paymentMethod}']`).prop('checked', true);
            
            // Show the result
            let resultText = Object.entries(historyItem.result)
                .map(([key, value]) => `"${key}": ${value}`)
                .join(",\n");
            
            $("#result").text(resultText).show();
            $("#copyBtn").show();
			
			  // Show sandbox amount only for "other" payment method
            if (inputs.paymentMethod === 'other') {
                const sandboxAmount = calculateSandboxAmount(historyItem.result.PCTotalCharges);
                $("#sandboxAmount").text(`Sandbox Amount: ${sandboxAmount}`).show();
            } else {
                $("#sandboxAmount").hide();
            }         
            
            // Update last calculated state
            lastCalculatedState = { ...inputs };
            
            // Scroll to result
            $('html, body').animate({
                scrollTop: $("#result").offset().top - 20
            }, 500);
        }
    });

    // Clear history button
    $('#clearHistoryBtn').click(function() {
    if (calculationHistory.length === 0) return;
    
    Swal.fire({
        title: 'Clear History?',
        text: 'This will permanently delete all calculation history.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#007BFF',
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'Cancel',
        width: '340px',  // Added to match other alerts
        customClass: {
            popup: 'small-swal-popup'  // Added to match other alerts
        }
    }).then((result) => {
        if (result.isConfirmed) {
            calculationHistory = [];
            saveHistory();
            updateHistoryDisplay();
            
            Swal.fire({
                title: 'Cleared!',
                text: 'History has been cleared.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                width: '340px',  // Added to match other alerts
                customClass: {
                    popup: 'small-swal-popup'  // Added to match other alerts
                }
            });
        }
    });
});

    function getCurrentFormState() {
        return {
            fareAdult: $("#fareAdult").val(),
            fareChild: $("#fareChild").val(),
            fareInfant: $("#fareInfant").val(),
            adults: $("#adults").val(),
            children: $("#children").val(),
            infants: $("#infants").val(),
            tripType: $("#tripType").val(),
            travelClass: $("#travelClass").val(),
            ticketType: $("input[name='ticketType']:checked").val(),
            paymentMethod: $("input[name='paymentMethod']:checked").val()
        };
    }

    function hasFormChanged() {
        if (!lastCalculatedState) return true;
        let currentState = getCurrentFormState();
        return JSON.stringify(currentState) !== JSON.stringify(lastCalculatedState);
    }

    $("#fareAdult, #fareChild, #fareInfant").focus(function() {
        if ($(this).val() === "0") $(this).val("");
    });

    $("#fareAdult, #fareChild, #fareInfant").blur(function() {
        if ($(this).val().trim() === "") $(this).val("0");
    });

    // Auto-update child dropdown when child fare is entered
    $("#fareChild").on('input blur', function() {
        let fareValue = parseFloat($(this).val()) || 0;
        let currentChildren = parseInt($("#children").val()) || 0;
        
        if (fareValue > 0 && currentChildren === 0) {
            $("#children").val("1");
        } else if (fareValue === 0 && currentChildren > 0) {
            $("#children").val("0");
        }
    });

    // Auto-update infant dropdown when infant fare is entered
    $("#fareInfant").on('input blur', function() {
        let fareValue = parseFloat($(this).val()) || 0;
        let currentInfants = parseInt($("#infants").val()) || 0;
        
        if (fareValue > 0 && currentInfants === 0) {
            $("#infants").val("1");
        } else if (fareValue === 0 && currentInfants > 0) {
            $("#infants").val("0");
        }
    });

    $("#calc").click(function () {
        // Get all values first for validation
        let fareAdult = parseFloat($("#fareAdult").val()) || 0;
        let fareChild = parseFloat($("#fareChild").val()) || 0;
        let fareInfant = parseFloat($("#fareInfant").val()) || 0;

        let adults = parseInt($("#adults").val()) || 0;
        let children = parseInt($("#children").val()) || 0;
        let infants = parseInt($("#infants").val()) || 0;

        let tripType = $("#tripType").val().toLowerCase();
        let travelClass = $("#travelClass").val().toLowerCase();
        let ticketType = $("input[name='ticketType']:checked").val();
        let paymentMethod = $("input[name='paymentMethod']:checked").val();

        let totalPax = adults + children + infants;

        // Run all validations FIRST before showing loader
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
            return;
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
            return;
        }

        if (adults > 0 && (fareAdult <= 0 || $("#fareAdult").val().trim() === "")) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter an amount for selected Adult passengers.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }
        
        if (children > 0 && (fareChild <= 0 || $("#fareChild").val().trim() === "")) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter an amount for selected Child passengers.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }
        
        if (infants > 0 && (fareInfant <= 0 || $("#fareInfant").val().trim() === "")) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter an amount for selected Infant passengers.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }

        // Check if fare amounts are entered but no passengers selected
        if (fareAdult > 0 && adults === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select Adult passengers for the entered fare amount.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }

        if (fareChild > 0 && children === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select Child passengers for the entered fare amount.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }

        if (fareInfant > 0 && infants === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select Infant passengers for the entered fare amount.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }

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
        
        if (!paymentMethod) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please select a payment method before calculating.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }
        
        if(ticketType == "monthly" && travelClass == "economy"){
             Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Payment method is not needed for monthly economy.',
                width: '340px',
                customClass: {
                popup: 'small-swal-popup'
                }
            });
            return;
        }

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

        // Check if form has changed since last calculation
        if (!hasFormChanged()) {
            // No changes - just scroll to existing result
            if ($("#result").is(":visible")) {
                $('html, body').animate({
                    scrollTop: $("#result").offset().top - 20
                }, 500);
            }
            return;
        }

        // ALL validations passed - NOW show loader and scroll immediately
        $("#loader").show();
        $("#result").hide();
        $("#copyBtn").hide();
	    $("#sandboxAmount").hide();

        
        // SCROLL IMMEDIATELY after showing the loader
        $('html, body').animate({
            scrollTop: $("#loader").offset().top - 20
        }, 500);
        
        // Use setTimeout to simulate processing time and allow loader to show
        setTimeout(function() {
            let totalFare = (fareAdult * adults) + (fareChild * children) + (fareInfant * infants);

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

            // Add surcharge fields for other payment method
            if (paymentMethod === "other") {
                result.PCAdultSurCharges = 0;
                result.PCChildSurCharges = 0;
                result.PCInfantSurCharges = 0;
            }

            // Helper function for rounding to 2 decimals
            function round2(n) {
                return Math.round(n * 100) / 100;
            }

            // Helper function to calculate surcharge
            function calculateSurcharge(amount) {
                return round2(amount * 2.5 / 100);
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

                // Add surcharges for other payment method
                if (paymentMethod === "other") {
                    result.PCAdultSurCharges = calculateSurcharge(result.PCAdultAmount * adults);
                }
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

                // Add surcharges for other payment method
                if (paymentMethod === "other") {
                    result.PCAdultSurCharges = calculateSurcharge(result.PCAdultAmount * adults);
                    result.PCChildSurCharges = calculateSurcharge(result.PCChildAmount * children);
                    result.PCInfantSurCharges = calculateSurcharge(result.PCInfantAmount * infants);
                }

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

                // Add surcharges for other payment method
                if (paymentMethod === "other") {
                    result.PCAdultSurCharges = calculateSurcharge(result.PCAdultAmount * adults);
                    result.PCChildSurCharges = calculateSurcharge(result.PCChildAmount * children);
                    result.PCInfantSurCharges = calculateSurcharge(result.PCInfantAmount * infants);
                }
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

            // Hide loader and show result
            $("#loader").hide();
            $("#result").text(resultText).show();
			
                // Show sandbox amount only for "other" payment method
            if (paymentMethod === 'other') {
                const sandboxAmount = calculateSandboxAmount(result.PCTotalCharges);
                $("#sandboxAmount").html(`<strong>Sandbox Amount:</strong> ${sandboxAmount}`).show();
            } else {
                $("#sandboxAmount").hide();
            }

            
            // Store current state as last calculated state
            let currentInputs = getCurrentFormState();
            lastCalculatedState = currentInputs;

            // Add to history
            addToHistory(currentInputs, result);

            // Show/hide copy button based on content
            if ($("#result").text().trim() !== "") {
                $("#copyBtn").show();
            } else {
                $("#copyBtn").hide();
            }
        }, 500); // 500ms delay to show loader
    });

    // Updated copy button click handler with popup and original icon behavior
    $("#copyBtn").click(function () {
        let text = $("#result").text().trim();
        if (!text) return;

        let btn = $(this);
        navigator.clipboard.writeText(text).then(() => {
            // Show the popup
            const popup = $("#copyPopup");
            popup.addClass("show");
            
            // Change to check icon (your original behavior)
            $("#clipboardIcon").hide();
            $("#checkIcon").show();
            
            // Hide the popup and restore icon after 1.75 seconds
            setTimeout(() => {
                popup.removeClass("show");
                $("#checkIcon").hide();
                $("#clipboardIcon").show();
            }, 1750);
        }).catch(() => {
            // Fallback for older browsers
            console.log("Clipboard API not supported, trying fallback...");
            
            // Create a temporary textarea
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                // Show the popup
                const popup = $("#copyPopup");
                popup.addClass("show");
                
                // Change to check icon
                $("#clipboardIcon").hide();
                $("#checkIcon").show();
                
                // Hide the popup and restore icon after 1.75 seconds
                setTimeout(() => {
                    popup.removeClass("show");
                    $("#checkIcon").hide();
                    $("#clipboardIcon").show();
                }, 1750);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            
            document.body.removeChild(textArea);
        });
    });

    $("#result").hide();
	 $("#sandboxAmount").hide();

    function resetFormFields() {
        $("#fareAdult").val("0");
        $("#fareChild").val("0");
        $("#fareInfant").val("0");
        $("#adults").val("1");
        $("#children").val("0");
        $("#infants").val("0");
        $("#tripType").val("oneway");
        $("#travelClass").val("economy");
        $("input[name='ticketType'][value='monthly']").prop("checked", true);
        $("input[name='paymentMethod'][value='airline']").prop("checked", true);
        $("#result").text("");
        $("#sandboxAmount").text("").hide();
        $("#copyBtn").hide();
        lastCalculatedState = null;
    }
    resetFormFields();
    // Load history on page load
    loadHistory();
});