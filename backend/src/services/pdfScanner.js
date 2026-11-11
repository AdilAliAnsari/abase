import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDF from "../models/PDF.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known subject code mappings for VTU / Engineering
const KNOWN_SUBJECTS = {
    BCS501: "Theory of Computation",
    BCS502: "Software Engineering & Project Management",
    BCS503: "Computer Networks",
    BCS504: "Database Management Systems",
    BCS304: "Data Structures & Applications",
    BCS401: "Design and Analysis of Algorithms",
    BCS402: "Operating Systems",
    BCS601: "Full Stack Development",
    BEC502: "Digital Signal Processing",
    BEC302: "Digital Electronics",
    BAI502: "Artificial Intelligence & Machine Learning",
    "18CS54": "Theory of Computation",
    "21CS54": "Theory of Computation",
    BCSL504: "Computer Networks Laboratory"
};

/**
 * Determine the root PDFs directory
 */
export function getPDFsRootDir() {
    if (process.env.PDFS_DIR) {
        return path.resolve(process.env.PDFS_DIR);
    }

    const candidates = [
        path.resolve(process.cwd(), "PDFs"),
        path.resolve(process.cwd(), "..", "PDFs"),
        path.resolve(__dirname, "../../../PDFs"),
        path.resolve(__dirname, "../../PDFs")
    ];

    for (const c of candidates) {
        if (fs.existsSync(c)) {
            return c;
        }
    }

    // Default: create in project root
    const defaultRoot = path.resolve(process.cwd(), "PDFs");
    try {
        fs.mkdirSync(defaultRoot, { recursive: true });
    } catch {}
    return defaultRoot;
}

/**
 * Automatically ensure standard branch/semester directory structure exists
 */
export function ensureDirectoryStructure(rootDir) {
    const branches = ["CSE", "ECE", "ISE", "Other_Branches"];
    const semesters = ["3rd_Sem", "5th_Sem", "6th_Sem"];

    for (const b of branches) {
        for (const s of semesters) {
            const dir = path.join(rootDir, b, s);
            if (!fs.existsSync(dir)) {
                try {
                    fs.mkdirSync(dir, { recursive: true });
                } catch (e) {
                    console.warn(`[PDF Scanner] Could not create folder ${dir}:`, e.message);
                }
            }
        }
    }
}

/**
 * Format bytes to readable string (e.g. 1.8 MB)
 */
export function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Extract semester number from directory or filename string
 */
export function extractSemester(str) {
    if (!str) return 5; // sensible default
    const m = str.match(/(\d+)(?:st|nd|rd|th)?_?(?:sem|semester)?/i) || str.match(/sem(?:ester)?_?(\d+)/i);
    if (m) {
        const num = parseInt(m[1] || m[2], 10);
        if (num >= 1 && num <= 8) return num;
    }
    return 5;
}

/**
 * Extract metadata from relative path and file stats
 * Example path: CSE/5th_Sem/BCS501_Module_3_Context_Free_Grammars.pdf
 */
export function parsePdfMetadata(relativeFilePath, stat) {
    // Normalize path with forward slashes
    const normalizedPath = relativeFilePath.replace(/\\/g, "/");
    const pathParts = normalizedPath.split("/").filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];
    const nameWithoutExt = fileName.replace(/\.pdf$/i, "");

    // 1. Determine Branch & Semester from folder path
    let branch = "CSE";
    let semester = 5;

    if (pathParts.length >= 2) {
        const branchPart = pathParts[0];
        if (/^(CSE|ECE|ISE|AIML|ME|Civil|EEE)$/i.test(branchPart)) {
            branch = branchPart.toUpperCase();
        } else if (/other/i.test(branchPart)) {
            branch = "Other_Branches";
        } else {
            branch = branchPart;
        }
    }

    if (pathParts.length >= 3) {
        semester = extractSemester(pathParts[1]);
    } else {
        semester = extractSemester(normalizedPath);
    }

    // 2. Extract Subject Code (handle underscores and boundaries)
    let subjectCode = "";
    const codeMatch = nameWithoutExt.match(/(?:^|[^a-zA-Z0-9])([A-Za-z]{2,4}\d{2,4}[A-Za-z]?)(?:$|[^a-zA-Z0-9])/i) ||
                      nameWithoutExt.match(/(?:^|[^a-zA-Z0-9])(\d{2}[A-Za-z]{2}\d{2,3}[A-Za-z]?)(?:$|[^a-zA-Z0-9])/i);
    if (codeMatch) {
        subjectCode = codeMatch[1].toUpperCase();
    }

    // 3. Extract Module
    let module = "";
    const modMatch = nameWithoutExt.match(/(?:Module|Mod)[\s_-]*([0-9IVX]+)/i);
    if (modMatch) {
        module = `Module ${modMatch[1]}`;
    }

    // 4. Determine Subject Name & Title
    let subjectName = "";
    if (subjectCode && KNOWN_SUBJECTS[subjectCode]) {
        subjectName = KNOWN_SUBJECTS[subjectCode];
    }

    // Look for explicit title clues in filename
    let extraTitle = nameWithoutExt;
    if (subjectCode) {
        extraTitle = extraTitle.replace(new RegExp(subjectCode, "gi"), "");
    }
    if (modMatch) {
        extraTitle = extraTitle.replace(/(?:Module|Mod)[\s_-]*([0-9IVX]+)/gi, "");
    }
    extraTitle = extraTitle.replace(/[_\-]+/g, " ").trim();

    if (!subjectName && extraTitle.length > 2) {
        subjectName = extraTitle;
    } else if (extraTitle.toLowerCase().includes("theory of computation") || extraTitle.toLowerCase().includes("toc")) {
        subjectName = "Theory of Computation";
    }

    // Compose a clean display title
    let title = "";
    if (subjectName && module) {
        title = `${subjectName} - ${module}`;
        if (extraTitle && extraTitle !== subjectName && !subjectName.includes(extraTitle)) {
            title += ` (${extraTitle})`;
        }
    } else if (subjectCode && module) {
        title = `${subjectCode} ${module}`;
        if (subjectName) title = `${subjectName} (${subjectCode} ${module})`;
    } else if (subjectName) {
        title = subjectName;
    } else {
        title = nameWithoutExt.replace(/[_\-]+/g, " ").trim();
    }

    // 5. Academic scheme determination
    let scheme = "2022 Scheme";
    if (/^18/i.test(subjectCode)) scheme = "2018 Scheme";
    else if (/^21/i.test(subjectCode)) scheme = "2021 Scheme";
    else if (/^B/i.test(subjectCode)) scheme = "2022 Scheme";

    return {
        title: title || nameWithoutExt,
        subjectCode: subjectCode || "",
        subjectName: subjectName || "",
        module: module || "",
        branch,
        semester,
        scheme,
        university: "VTU",
        materialType: module ? "Module Notes" : "PDF",
        fileName,
        localFilePath: normalizedPath,
        fileSize: formatBytes(stat.size),
        fileSizeBytes: stat.size,
        author: "VTU Faculty",
        source: "local-folder",
        uploadedAt: stat.birthtime || stat.mtime || new Date(),
        status: "published",
        isAvailable: true,
        price: 0
    };
}

/**
 * Verify if file is completely copied and has valid PDF magic header
 */
function isFileValidAndReady(fullPath) {
    try {
        const stat = fs.statSync(fullPath);
        if (stat.size < 10) return false;

        const fd = fs.openSync(fullPath, "r");
        const buffer = Buffer.alloc(5);
        fs.readSync(fd, buffer, 0, 5, 0);
        fs.closeSync(fd);

        const header = buffer.toString("utf-8");
        return header.startsWith("%PDF");
    } catch {
        return false;
    }
}

/**
 * Recursively find all PDF files in a directory
 */
function findPdfFilesRecursively(dir, rootDir, results = []) {
    if (!fs.existsSync(dir)) return results;

    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        console.warn(`[PDF Scanner] Could not read directory ${dir}:`, e.message);
        return results;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip hidden directories and node_modules
            if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
                findPdfFilesRecursively(fullPath, rootDir, results);
            }
        } else if (entry.isFile()) {
            if (path.extname(entry.name).toLowerCase() === ".pdf") {
                const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
                results.push({ fullPath, relativePath, fileName: entry.name });
            }
        }
    }
    return results;
}

/**
 * Send in-app notification when a new PDF is detected
 */
async function sendNewPdfNotifications(newPDF) {
    try {
        const users = await User.find({}, "_id role username");
        if (!users || users.length === 0) return;

        const notifDocs = [];
        const notifTitle = `New study material added: ${newPDF.title}`;
        const notifMessage = `Branch: ${newPDF.branch} | Semester: ${newPDF.semester}${newPDF.subjectCode ? ` | Code: ${newPDF.subjectCode}` : ""}`;

        for (const u of users) {
            // Do not notify the uploader about their own upload
            if (newPDF.uploadedBy && newPDF.uploadedBy.toString() === u._id.toString()) {
                continue;
            }

            // Check if notification already exists to avoid duplicates
            const existing = await Notification.findOne({
                user: u._id,
                pdfId: newPDF._id,
                type: "pdf_added"
            });

            if (!existing) {
                notifDocs.push({
                    user: u._id,
                    title: notifTitle,
                    message: notifMessage,
                    type: "pdf_added",
                    pdfId: newPDF._id,
                    metadata: {
                        branch: newPDF.branch,
                        semester: newPDF.semester,
                        subjectCode: newPDF.subjectCode,
                        pdfTitle: newPDF.title
                    },
                    read: false,
                    createdAt: new Date()
                });
            }
        }

        if (notifDocs.length > 0) {
            await Notification.insertMany(notifDocs);
            console.log(`[PDF Scanner] 📢 Created ${notifDocs.length} in-app notification(s) for "${newPDF.title}"`);
        }
    } catch (err) {
        console.error("[PDF Scanner] Error creating notifications:", err.message);
    }
}

/**
 * Main function to scan the root PDFs folder and sync with MongoDB
 */
export async function scanPDFsFolder(triggerSource = "startup") {
    const rootDir = getPDFsRootDir();
    console.log(`[PDF Scanner] 🔍 Starting scan (Trigger: ${triggerSource}) in: ${rootDir}`);

    ensureDirectoryStructure(rootDir);

    const foundFiles = findPdfFilesRecursively(rootDir, rootDir);
    console.log(`[PDF Scanner] Found ${foundFiles.length} PDF file(s) in local folder.`);

    const foundPathsSet = new Set();
    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const fileItem of foundFiles) {
        const { fullPath, relativePath } = fileItem;
        foundPathsSet.add(relativePath);

        try {
            if (!isFileValidAndReady(fullPath)) {
                console.warn(`[PDF Scanner] ⚠️ Skipping incomplete or invalid PDF: ${relativePath}`);
                skippedCount++;
                continue;
            }

            const stat = fs.statSync(fullPath);
            const metadata = parsePdfMetadata(relativePath, stat);

            // Check if document already exists by stable identifier localFilePath
            let existingDoc = await PDF.findOne({ localFilePath: relativePath });

            if (!existingDoc) {
                // Also check by fileName in same branch/semester to detect moves/renames
                existingDoc = await PDF.findOne({
                    fileName: metadata.fileName,
                    branch: metadata.branch,
                    semester: metadata.semester,
                    source: "local-folder"
                });
            }

            if (!existingDoc) {
                // 1. Newly added PDF
                const newPDF = new PDF({
                    ...metadata,
                    notified: false
                });

                // Assign public download endpoint URL
                newPDF.pdfFileUrl = `/api/pdfs/${newPDF._id}/download`;

                await newPDF.save();
                newCount++;
                console.log(`[PDF Scanner] ➕ Added new PDF: "${newPDF.title}" [${relativePath}] (${newPDF.fileSize})`);

                // Send in-app notification
                await sendNewPdfNotifications(newPDF);

                // Mark notified
                newPDF.notified = true;
                await newPDF.save();
            } else {
                // 2. Existing record - update if modified or moved
                let isModified = false;
                if (!existingDoc.isAvailable) {
                    existingDoc.isAvailable = true;
                    isModified = true;
                }
                if (existingDoc.localFilePath !== relativePath) {
                    existingDoc.localFilePath = relativePath;
                    isModified = true;
                }
                if (existingDoc.fileSizeBytes !== stat.size) {
                    existingDoc.fileSizeBytes = stat.size;
                    existingDoc.fileSize = formatBytes(stat.size);
                    isModified = true;
                }
                if (metadata.subjectCode && existingDoc.subjectCode !== metadata.subjectCode) {
                    existingDoc.subjectCode = metadata.subjectCode;
                    existingDoc.subjectName = metadata.subjectName;
                    existingDoc.title = metadata.title;
                    existingDoc.module = metadata.module;
                    isModified = true;
                }
                if (!existingDoc.pdfFileUrl || !existingDoc.pdfFileUrl.includes("/download")) {
                    existingDoc.pdfFileUrl = `/api/pdfs/${existingDoc._id}/download`;
                    isModified = true;
                }

                if (isModified) {
                    await existingDoc.save();
                    updatedCount++;
                    console.log(`[PDF Scanner] 🔄 Updated existing PDF: "${existingDoc.title}"`);
                } else {
                    skippedCount++;
                }

                // If not yet notified (e.g. previous crash before notifying), notify now
                if (!existingDoc.notified) {
                    await sendNewPdfNotifications(existingDoc);
                    existingDoc.notified = true;
                    await existingDoc.save();
                }
            }
        } catch (err) {
            console.error(`[PDF Scanner] ❌ Error processing file ${relativePath}:`, err.message);
            skippedCount++;
        }
    }

    // 3. Mark removed files as unavailable in DB
    try {
        const localFolderDocs = await PDF.find({ source: "local-folder", isAvailable: true });
        for (const doc of localFolderDocs) {
            if (doc.localFilePath && !foundPathsSet.has(doc.localFilePath)) {
                doc.isAvailable = false;
                await doc.save();
                console.log(`[PDF Scanner] 🗑️ Marked missing PDF as unavailable: ${doc.title} (${doc.localFilePath})`);
            }
        }
    } catch (err) {
        console.error("[PDF Scanner] Error checking removed files:", err.message);
    }

    console.log(`[PDF Scanner] ✅ Scan completed. Added: ${newCount}, Updated: ${updatedCount}, Unchanged/Skipped: ${skippedCount}`);

    return {
        success: true,
        totalFound: foundFiles.length,
        added: newCount,
        updated: updatedCount,
        skipped: skippedCount
    };
}

let scanIntervalTimer = null;
let fsWatcher = null;
let debounceTimeout = null;

/**
 * Initialize automatic background scanner & watcher
 */
export function initPdfScanner() {
    const isEnabled = process.env.ENABLE_PDF_SCANNER !== "false";
    if (!isEnabled) {
        console.log("[PDF Scanner] Automatic scanner is disabled via ENABLE_PDF_SCANNER=false");
        return;
    }

    const rootDir = getPDFsRootDir();
    ensureDirectoryStructure(rootDir);

    // 1. Run initial scan on startup
    scanPDFsFolder("startup").catch(err => {
        console.error("[PDF Scanner] Startup scan failed:", err.message);
    });

    // 2. Set up filesystem watcher for live addition of PDFs
    const watchEnabled = process.env.PDF_WATCHER_ENABLED !== "false";
    if (watchEnabled && fs.existsSync(rootDir)) {
        try {
            fsWatcher = fs.watch(rootDir, { recursive: true }, (eventType, filename) => {
                if (filename && filename.toLowerCase().endsWith(".pdf")) {
                    // Debounce rapid events
                    if (debounceTimeout) clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        console.log(`[PDF Watcher] 📂 Change detected in ${filename} (${eventType}). Triggering rescan...`);
                        scanPDFsFolder("fs-watcher").catch(err => {
                            console.error("[PDF Watcher] Rescan failed:", err.message);
                        });
                    }, 1500);
                }
            });
            console.log(`[PDF Scanner] 👁️ Live filesystem watcher active on: ${rootDir}`);
        } catch (e) {
            console.warn("[PDF Scanner] Filesystem watcher could not be started, relying on interval:", e.message);
        }
    }

    // 3. Optional periodic background scan interval (default: 60s)
    const intervalMs = parseInt(process.env.PDF_SCAN_INTERVAL_MS, 10) || 60000;
    if (intervalMs > 0) {
        scanIntervalTimer = setInterval(() => {
            scanPDFsFolder("periodic-interval").catch(err => {
                console.error("[PDF Scanner] Interval scan failed:", err.message);
            });
        }, intervalMs);
        console.log(`[PDF Scanner] ⏱️ Periodic scanner scheduled every ${intervalMs / 1000}s`);
    }
}

/**
 * Teardown background timers & watchers (for clean shutdown / tests)
 */
export function stopPdfScanner() {
    if (scanIntervalTimer) clearInterval(scanIntervalTimer);
    if (fsWatcher) fsWatcher.close();
    if (debounceTimeout) clearTimeout(debounceTimeout);
}

export default {
    getPDFsRootDir,
    ensureDirectoryStructure,
    parsePdfMetadata,
    scanPDFsFolder,
    initPdfScanner,
    stopPdfScanner
};
