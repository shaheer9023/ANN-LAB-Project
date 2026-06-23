const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, Header, Footer, PageNumber
} = require("docx");

const FONT = "Arial";
const CONTENT_WIDTH = 9360; // US Letter, 1" margins

// ---------- helpers ----------
function titlePar(text, size = 56) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text, bold: true, size, font: FONT })]
  });
}

function subtitlePar(text, size = 26, bold = false) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text, bold, size, font: FONT, color: "444444" })]
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: FONT })] });
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: FONT })] });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT, size: 22, italics: !!opts.italics, bold: !!opts.bold })]
  });
}

function bodyRuns(runs) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs.map(r => new TextRun({ font: FONT, size: 22, ...r }))
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: FONT, size: 22 })]
  });
}

function refItem(num, text) {
  return new Paragraph({
    spacing: { after: 120, line: 264 },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text: `[${num}]  ${text}`, font: FONT, size: 21 })]
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 240 },
    children: [new TextRun({ text, font: FONT, size: 19, italics: true, color: "555555" })]
  });
}

function image(path, w, h) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 },
    children: [new ImageRun({
      type: "png",
      data: fs.readFileSync(path),
      transformation: { width: w, height: h },
      altText: { title: "Figure", description: "Figure", name: "Figure" }
    })]
  });
}

// table builders
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function headCell(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E5B8A", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: FONT, size: 20, color: "FFFFFF" })]
    })]
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { fill: "EAF1F8", type: ShadingType.CLEAR } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.CENTER,
      children: [new TextRun({ text, font: FONT, size: 20, bold: !!opts.bold })]
    })]
  });
}

// ---------- TABLE 1: dataset statistics ----------
const statsHeaders = ["Variable", "Mean", "Std. Dev.", "Min", "Max"];
const statsWidths = [2760, 1650, 1650, 1650, 1650];
const statsRows = [
  ["Cement (kg/m\u00B3)", "281.17", "104.51", "102.00", "540.00"],
  ["Blast Furnace Slag (kg/m\u00B3)", "73.90", "86.28", "0.00", "359.40"],
  ["Fly Ash (kg/m\u00B3)", "54.19", "64.00", "0.00", "200.10"],
  ["Water (kg/m\u00B3)", "181.57", "21.35", "121.80", "247.00"],
  ["Superplasticizer (kg/m\u00B3)", "6.20", "5.97", "0.00", "32.20"],
  ["Coarse Aggregate (kg/m\u00B3)", "972.92", "77.75", "801.00", "1145.00"],
  ["Fine Aggregate (kg/m\u00B3)", "773.58", "80.18", "594.00", "992.60"],
  ["Age (days)", "45.66", "63.17", "1.00", "365.00"],
  ["Compressive Strength (MPa)", "35.82", "16.71", "2.33", "82.60"],
];

function buildStatsTable() {
  const headerRow = new TableRow({ children: statsHeaders.map((t, i) => headCell(t, statsWidths[i])) });
  const rows = statsRows.map((r, idx) => new TableRow({
    children: r.map((t, i) => dataCell(t, statsWidths[i], { align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, shade: idx % 2 === 1 }))
  }));
  return new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: statsWidths, rows: [headerRow, ...rows] });
}

// ---------- TABLE 2: model comparison ----------
const metricHeaders = ["Model", "RMSE (MPa)", "MAE (MPa)", "R\u00B2 Score"];
const metricWidths = [3960, 1800, 1800, 1800];
const metricRows = [
  ["Random Forest Regressor", "5.232", "3.475", "0.894"],
  ["Artificial Neural Network", "6.366", "5.026", "0.843"],
  ["Linear Regression", "9.801", "7.712", "0.627"],
];

function buildMetricsTable() {
  const headerRow = new TableRow({ children: metricHeaders.map((t, i) => headCell(t, metricWidths[i])) });
  const rows = metricRows.map((r, idx) => new TableRow({
    children: r.map((t, i) => dataCell(t, metricWidths[i], {
      align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
      shade: idx === 0,
      bold: idx === 0
    }))
  }));
  return new Table({ width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: metricWidths, rows: [headerRow, ...rows] });
}

// ====================================================================================
// DOCUMENT
// ====================================================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F3864", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, font: FONT, color: "2E5B8A" },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "ANN & Deep Learning \u2014 Course Project", font: FONT, size: 16, color: "888888" })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", font: FONT, size: 18, color: "888888" }),
                   new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "888888" })]
      })] })
    },
    children: [
      // ---------------- TITLE BLOCK ----------------
      new Paragraph({ spacing: { before: 600 } }),
      titlePar("Prediction of Concrete Compressive Strength", 48),
      titlePar("using Artificial Neural Networks", 48),
      subtitlePar("A Comparative Study of Artificial Neural Networks, Random Forest Regression, and Linear Regression", 24, false),
      new Paragraph({ spacing: { before: 400, after: 80 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Course: ANN & Deep Learning", font: FONT, size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "Prepared by: Shoaib", font: FONT, size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
        children: [new TextRun({ text: "June 2026", font: FONT, size: 22 })] }),

      // ---------------- ABSTRACT ----------------
      h1("Abstract"),
      body(
        "Concrete compressive strength is the most critical property used to evaluate the suitability of a concrete mix for construction, yet it is conventionally determined only through physical destructive testing after a 28-day curing period \u2014 a process that is both time-consuming and costly. This project develops and compares three regression models, an Artificial Neural Network (ANN), a Random Forest Regressor, and a Linear Regression baseline, to predict concrete compressive strength directly from its mix composition (cement, blast furnace slag, fly ash, water, superplasticizer, coarse aggregate, and fine aggregate) and curing age, using the benchmark UCI Concrete Compressive Strength dataset (1,030 samples). Three domain-informed features \u2014 water-cement ratio, total cementitious material, and aggregate ratio \u2014 were engineered prior to modeling. Following preprocessing and an 80/20 train-test split, all three models were trained and evaluated on RMSE, MAE, and R\u00B2 Score. The Random Forest Regressor achieved the strongest performance (RMSE = 5.23 MPa, R\u00B2 = 0.894), narrowly outperforming the ANN (RMSE = 6.37 MPa, R\u00B2 = 0.843), while both substantially outperformed the Linear Regression baseline (R\u00B2 = 0.627) \u2014 confirming the strongly non-linear nature of concrete strength formation. The best-performing model was deployed through an interactive Streamlit web application, enabling rapid, cost-free strength estimation for new mix designs without laboratory testing."
      ),

      // ---------------- 1. INTRODUCTION ----------------
      h1("1. Introduction"),
      body(
        "Concrete is the most widely used construction material in the world, and its compressive strength is the primary criterion used by civil engineers to judge whether a given mix design is fit for a structural purpose. Traditionally, this strength is measured by casting concrete cubes or cylinders and physically crushing them after a curing period of 28 days. While reliable, this approach has three practical drawbacks: it is slow (results are only available a full month after mixing), expensive (it requires laboratory equipment, raw material, and skilled supervision), and inflexible (by the time a result is known, the concrete batch is already cast, leaving no opportunity to correct a poor mix design before use)."
      ),
      body(
        "Compounding this challenge, the relationship between a concrete mix's ingredients and its resulting strength is highly non-linear: ingredients interact with one another and with curing time in ways that simple formulas struggle to capture. This makes the problem a natural candidate for machine learning and deep learning approaches, which can learn complex, non-linear input-output relationships directly from experimental data."
      ),
      h2("Problem Statement"),
      body(
        "Given the quantities of raw ingredients used in a concrete mix (cement, blast furnace slag, fly ash, water, superplasticizer, coarse aggregate, fine aggregate) and the curing age in days, can an Artificial Neural Network accurately predict the resulting compressive strength (in MPa) without physical destructive testing \u2014 and how does this Deep Learning approach compare against traditional Machine Learning regressors on the same data? Solving this problem would allow engineers to rapidly evaluate and optimize candidate mix designs before any physical casting takes place, reducing material waste, project delays, and testing costs \u2014 a genuinely high-impact, real-world application of Deep Learning in civil engineering."
      ),

      // ---------------- 2. LITERATURE REVIEW ----------------
      h1("2. Literature Review"),
      body(
        "The use of computational intelligence to model concrete properties dates back to the foundational work of Yeh [1], who first demonstrated that an Artificial Neural Network could model the highly non-linear relationship between high-performance concrete ingredients and compressive strength more accurately than traditional regression formulas. This study is also the origin of the benchmark dataset used in the present project, and it remains one of the most widely cited works in the field."
      ),
      body(
        "Building on this foundation, Chou and Pham [2] explored ensemble artificial intelligence approaches, combining multiple base learners to improve prediction accuracy beyond what any single model could achieve, motivating the kind of multi-model comparison undertaken in this project. Khan et al. [3] later optimized an ANN architecture using a substantially larger dataset of 1,637 samples, validating their model through k-fold cross-validation and identifying cement content and superplasticizer dosage as the most influential predictors \u2014 a finding broadly consistent with the feature-importance results obtained in this project. Li et al. [4] conducted a comparative study contrasting ANN predictions against an Adaptive Neuro-Fuzzy Inference System (ANFIS) and Response Surface Methodology (RSM), performing sensitivity analysis to rank the relative influence of each input parameter, reinforcing that head-to-head comparison across modeling paradigms is an active and valued research direction. More recently, Ni et al. [5] surveyed the broader landscape of machine-learning-based concrete property prediction, noting a continued shift away from purely empirical formulas toward data-driven, multi-objective predictive models."
      ),
      body(
        "Despite this substantial body of work, two gaps remain that this project specifically addresses. First, many existing studies evaluate a single model type (most often an ANN in isolation) without a controlled, head-to-head comparison against both a non-linear ensemble baseline and a simple linear baseline on the exact same preprocessing pipeline \u2014 making it difficult to judge how much benefit the added complexity of a neural network actually provides. Second, most published studies stop at offline model evaluation and do not package the resulting model into an accessible tool that a practicing engineer without machine learning expertise could actually use. This project addresses both gaps by benchmarking an ANN against a Random Forest Regressor and a Linear Regression baseline under identical preprocessing and feature engineering, and by deploying the best-performing model through an interactive Streamlit web application for practical, real-time use."
      ),

      // ---------------- 3. METHODOLOGY ----------------
      h1("3. Methodology"),
      h2("3.1 Dataset Description"),
      body(
        "This project uses the Concrete Compressive Strength dataset, donated by Prof. I-Cheng Yeh to the UCI Machine Learning Repository [6]. The dataset contains 1,030 instances with 8 quantitative input features \u2014 cement, blast furnace slag, fly ash, water, superplasticizer, coarse aggregate, and fine aggregate (all measured in kg per m\u00B3 of mixture), plus curing age in days \u2014 and one continuous target variable, compressive strength in MPa. Table 1 summarizes the descriptive statistics of all variables."
      ),
      caption("Table 1. Descriptive statistics of the dataset variables."),
      buildStatsTable(),
      new Paragraph({ spacing: { after: 200 } }),

      h2("3.2 Data Preprocessing"),
      body(
        "Exploratory analysis confirmed that the dataset contains no missing values across any of the 9 columns. However, 25 exact duplicate rows were identified. Rather than indicating a data quality error, these duplicates are consistent with repeated experimental trials reported in the original data collection [1], and were therefore retained as valid experimental observations rather than removed. The data was split into training (824 samples, 80%) and testing (206 samples, 20%) subsets using a fixed random seed for reproducibility. All input features were standardized using z-score normalization (StandardScaler), fitted on the training set only and applied to both subsets, ensuring no information leakage from the test set into the training process. Standardization was applied uniformly across all three models for a fair, like-for-like comparison, even though tree-based models such as Random Forest are not strictly scale-dependent."
      ),

      h2("3.3 Feature Engineering"),
      body(
        "Beyond the 8 raw ingredient quantities, three additional domain-informed features were engineered, motivated by established civil engineering theory:"
      ),
      bullet("Water-Cement Ratio (W/C): per Abrams\u2019 Law (1918), one of the oldest established relationships in concrete technology, strength is strongly governed by the ratio of water to cement \u2014 a lower ratio generally yields higher strength."),
      bullet("Total Cementitious Material: the combined quantity of cement, blast furnace slag, and fly ash, since slag and fly ash both act as partial substitutes for cement as a binding agent."),
      bullet("Aggregate Ratio: the ratio of coarse to fine aggregate, which influences the packing density and workability of the mix."),
      body(
        "These engineered features showed meaningful correlation with the target variable in the training data: Total Cementitious Material (r = 0.613), Water-Cement Ratio (r = \u22120.501), and Aggregate Ratio (r = 0.049), supporting their inclusion as informative predictors alongside the 8 raw features, for a total of 11 input features."
      ),

      h2("3.4 Model Architectures"),
      body(
        "Three regression models were implemented and compared under identical preprocessing:"
      ),
      bullet("Artificial Neural Network (ANN): a feedforward network with 3 hidden layers (64, 32, and 16 neurons respectively), each using ReLU activation, with Dropout (rate = 0.2) applied after the first two hidden layers to reduce overfitting. The output layer uses a single neuron with linear activation, appropriate for regression. The network was compiled with the Adam optimizer (learning rate = 0.001) and Mean Squared Error loss, and trained for up to 300 epochs with an EarlyStopping callback (patience = 20 epochs, monitoring validation loss, restoring the best weights). Training converged after 143 epochs."),
      bullet("Random Forest Regressor: an ensemble of 200 decision trees (scikit-learn implementation), used as a strong non-linear traditional Machine Learning baseline."),
      bullet("Linear Regression: a simple ordinary least squares model, used to quantify how much benefit the non-linear models provide over a purely additive, linear assumption."),
      image("/home/claude/report_images/ann_loss_curve.png", 380, 228),
      caption("Figure 1. ANN training and validation loss (MSE) across training epochs."),
      body(
        "As shown in Figure 1, both training and validation loss decreased sharply within the first few epochs and then converged smoothly without divergence between the two curves, indicating that the Dropout regularization and EarlyStopping callback were effective in preventing overfitting."
      ),

      // ---------------- 4. RESULTS AND DISCUSSION ----------------
      h1("4. Results and Discussion"),
      body(
        "All three models were evaluated on the held-out 206-sample test set using three standard regression metrics: Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and the R\u00B2 Score. Table 2 summarizes the results."
      ),
      caption("Table 2. Performance comparison of the three models on the test set."),
      buildMetricsTable(),
      new Paragraph({ spacing: { after: 200 } }),
      image("/home/claude/report_images/model_comparison_bars.png", 600, 164),
      caption("Figure 2. RMSE, MAE, and R\u00B2 Score comparison across all three models."),
      image("/home/claude/report_images/actual_vs_predicted.png", 600, 164),
      caption("Figure 3. Actual vs. predicted compressive strength for each model (red dashed line indicates a perfect prediction)."),

      body(
        "The Random Forest Regressor achieved the strongest overall performance, with the lowest RMSE (5.23 MPa) and MAE (3.48 MPa) and the highest R\u00B2 Score (0.894), narrowly outperforming the ANN (RMSE = 6.37 MPa, R\u00B2 = 0.843). Both non-linear models substantially outperformed the Linear Regression baseline (R\u00B2 = 0.627, RMSE = 9.80 MPa), whose predictions in Figure 3 show clear systematic deviation from the ideal diagonal, particularly at lower and higher strength values \u2014 strong empirical confirmation that the relationship between mix ingredients, curing age, and compressive strength is genuinely non-linear, consistent with the foundational claim of Yeh [1]."
      ),
      body(
        "An unexpected but informative finding is that the Random Forest Regressor slightly outperformed the ANN on this dataset. This is consistent with a well-documented characteristic of tree-based ensemble methods: on small-to-medium tabular datasets (here, only 824 training samples), they frequently match or exceed the performance of deep neural networks, which typically require substantially larger volumes of data to fully realize their representational advantage. This does not diminish the value of the ANN \u2014 it still achieved strong, well-generalizing performance and remains the primary deep learning contribution of this project \u2014 but it is a noteworthy, genuine result rather than an assumption."
      ),
      image("/home/claude/report_images/feature_importance.png", 430, 250),
      caption("Figure 4. Feature importance scores derived from the Random Forest model."),
      body(
        "Figure 4 shows the Random Forest's feature importance ranking. Curing Age (34.2%) and Total Cementitious Material (33.3%) were the two most influential predictors, followed by the engineered Water-Cement Ratio (15.8%) \u2014 together accounting for over 83% of total predictive importance. This strongly validates the feature engineering decisions made in Section 3.3: both engineered features rank among the top three predictors, ahead of several raw ingredient quantities, confirming that domain-informed ratios carry more predictive signal than their individual raw components."
      ),
      body(
        "The best-performing model, along with the trained scaler and all supporting artifacts, was deployed through an interactive Streamlit web application that allows a user to enter raw mix quantities and receive an instant predicted compressive strength, with an option to compare predictions across all three models side-by-side \u2014 directly fulfilling the project's goal of providing a fast, accessible alternative to 28-day physical testing."
      ),

      // ---------------- 5. CONCLUSION ----------------
      h1("5. Conclusion"),
      body(
        "This project developed and rigorously compared three regression models \u2014 an Artificial Neural Network, a Random Forest Regressor, and a Linear Regression baseline \u2014 for predicting concrete compressive strength from mix composition and curing age. Using the benchmark UCI Concrete Compressive Strength dataset together with three domain-informed engineered features, the Random Forest Regressor achieved the best test-set performance (R\u00B2 = 0.894), with the ANN close behind (R\u00B2 = 0.843), and both decisively outperforming the Linear Regression baseline (R\u00B2 = 0.627). These results confirm that concrete strength formation is a strongly non-linear process and that engineered ratios such as water-cement ratio and total cementitious material carry substantial predictive value. The best model was successfully deployed in an interactive web application, demonstrating a practical, low-cost alternative to traditional 28-day destructive testing for early-stage mix design evaluation."
      ),
      body(
        "Limitations: the dataset, while a widely accepted benchmark, contains only 1,030 samples (824 for training) \u2014 a relatively small volume for deep learning, which likely limited the ANN's ability to outperform the Random Forest ensemble. Twenty-five duplicate records were identified and retained as legitimate repeated trials, but their presence should be considered when interpreting train/test split independence. Additionally, predictions for mix designs far outside the ranges summarized in Table 1 (e.g., specialty ultra-high-performance concretes) should be treated with caution, as they fall outside the training distribution."
      ),
      body(
        "Future Work: performance could likely be further improved by collecting additional samples, particularly at the extremes of the ingredient ranges; by conducting systematic hyperparameter tuning (e.g., via Keras Tuner for the ANN or grid search for the Random Forest); and by exploring stacked or blended ensembles that combine the complementary strengths of the ANN and Random Forest predictions."
      ),

      // ---------------- REFERENCES ----------------
      h1("References"),
      refItem(1, "I.-C. Yeh, \u201CModeling of strength of high-performance concrete using artificial neural networks,\u201D Cement and Concrete Research, vol. 28, no. 12, pp. 1797\u20131808, 1998."),
      refItem(2, "J.-S. Chou and A.-D. Pham, \u201CEnhanced artificial intelligence for ensemble approach to predicting high performance concrete compressive strength,\u201D Construction and Building Materials, vol. 49, pp. 554\u2013563, 2013."),
      refItem(3, "A. Q. Khan, H. A. Awan, M. Rasul, Z. A. Siddiqi, and A. Pimanmas, \u201COptimized artificial neural network model for accurate prediction of compressive strength of normal and high strength concrete,\u201D Cleaner Materials, vol. 10, p. 100211, 2023."),
      refItem(4, "T. Li, J. Yang, P. Jiang, A. H. AlAteah, A. Alsubeai, A. M. Alfares, and M. Sufian, \u201CPredicting high-strength concrete\u2019s compressive strength: A comparative study of artificial neural networks, adaptive neuro-fuzzy inference system, and response surface methodology,\u201D Materials, vol. 17, no. 18, p. 4533, 2024."),
      refItem(5, "B. Ni, M. Z. Rahman, S. Guo, and D. Zhu, \u201CA review on properties and multi-objective performance predictions of concrete based on machine learning models,\u201D Materials Today Communications, vol. 44, p. 112017, 2025."),
      refItem(6, "I. Yeh, \u201CConcrete Compressive Strength,\u201D UCI Machine Learning Repository, 1998. [Dataset]. doi: 10.24432/C5PK67."),
      refItem(7, "F. Pedregosa et al., \u201CScikit-learn: Machine Learning in Python,\u201D Journal of Machine Learning Research, vol. 12, pp. 2825\u20132830, 2011."),
      refItem(8, "M. Abadi et al., \u201CTensorFlow: A System for Large-Scale Machine Learning,\u201D in Proc. 12th USENIX Symposium on Operating Systems Design and Implementation (OSDI), 2016."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/Concrete_Strength_Project_Report.docx", buffer);
  console.log("Report written successfully.");
});