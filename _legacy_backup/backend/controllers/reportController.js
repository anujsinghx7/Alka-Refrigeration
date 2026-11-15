/**
 * Report Controller
 * Handles Excel report generation and download for admin
 * Uses exceljs library for creating professional spreadsheets
 */

const ExcelJS = require('exceljs');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

/**
 * Helper: Style header row
 */
function styleHeaderRow(worksheet) {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A237E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Auto-width columns
  worksheet.columns.forEach(col => {
    col.width = Math.max(col.header.length + 5, 15);
  });
}

/**
 * @route   GET /api/admin/export/customers
 * @desc    Export all customer data as Excel
 * @access  Admin
 */
const exportCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: { $ne: 'admin' } })
      .select('-__v -googleId')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alka Refrigeration';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Customers', {
      headerFooter: { firstHeader: 'Alka Refrigeration — Customer Report' },
    });

    worksheet.columns = [
      { header: 'S.No', key: 'sno' },
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Mobile', key: 'mobile' },
      { header: 'Location', key: 'location' },
      { header: 'Registered On', key: 'createdAt' },
    ];

    customers.forEach((c, i) => {
      worksheet.addRow({
        sno: i + 1,
        name: c.name,
        email: c.email,
        mobile: c.mobile || 'N/A',
        location: c.location || 'N/A',
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A',
      });
    });

    styleHeaderRow(worksheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export customers error:', error.message);
    res.status(500).json({ message: 'Failed to export customers' });
  }
};

/**
 * @route   GET /api/admin/export/complaints
 * @desc    Export all complaint data as Excel
 * @access  Admin
 */
const exportComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alka Refrigeration';

    const worksheet = workbook.addWorksheet('Complaints');

    worksheet.columns = [
      { header: 'S.No', key: 'sno' },
      { header: 'Customer Name', key: 'name' },
      { header: 'Mobile', key: 'mobile' },
      { header: 'Location', key: 'location' },
      { header: 'Service Type', key: 'serviceType' },
      { header: 'Preferred Date', key: 'preferredDate' },
      { header: 'Preferred Time', key: 'preferredTime' },
      { header: 'Status', key: 'status' },
      { header: 'Call Status', key: 'callStatus' },
      { header: 'Confirmed', key: 'isConfirmed' },
      { header: 'Work Status', key: 'workStatus' },
      { header: 'Technician', key: 'technicianStatus' },
      { header: 'Amount (₹)', key: 'amount' },
      { header: 'Payment', key: 'paymentStatus' },
      { header: 'Created On', key: 'createdAt' },
    ];

    complaints.forEach((c, i) => {
      worksheet.addRow({
        sno: i + 1,
        name: c.name,
        mobile: c.mobile,
        location: c.location,
        serviceType: c.serviceType,
        preferredDate: c.preferredDate ? new Date(c.preferredDate).toLocaleDateString('en-IN') : 'N/A',
        preferredTime: c.preferredTime,
        status: c.status,
        callStatus: c.callStatus,
        isConfirmed: c.isConfirmed ? 'Yes' : 'No',
        workStatus: c.workStatus,
        technicianStatus: c.technicianStatus,
        amount: c.amount,
        paymentStatus: c.paymentStatus,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A',
      });
    });

    styleHeaderRow(worksheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export complaints error:', error.message);
    res.status(500).json({ message: 'Failed to export complaints' });
  }
};

/**
 * @route   GET /api/admin/export/service-analysis
 * @desc    Export service type analysis as Excel
 * @access  Admin
 */
const exportServiceAnalysis = async (req, res) => {
  try {
    const analysis = await Complaint.aggregate([
      {
        $group: {
          _id: '$serviceType',
          totalComplaints: { $sum: 1 },
          completedComplaints: {
            $sum: { $cond: [{ $eq: ['$workStatus', 'Done'] }, 1, 0] },
          },
          pendingComplaints: {
            $sum: { $cond: [{ $eq: ['$workStatus', 'Pending'] }, 1, 0] },
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$amount', 0] },
          },
          pendingPayments: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$paymentStatus', 'Pending'] }, { $gt: ['$amount', 0] }] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { totalComplaints: -1 } },
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alka Refrigeration';

    const worksheet = workbook.addWorksheet('Service Analysis');

    worksheet.columns = [
      { header: 'S.No', key: 'sno' },
      { header: 'Service Type', key: 'serviceType' },
      { header: 'Total Complaints', key: 'totalComplaints' },
      { header: 'Completed', key: 'completedComplaints' },
      { header: 'Pending', key: 'pendingComplaints' },
      { header: 'Total Revenue (₹)', key: 'totalRevenue' },
      { header: 'Pending Payments (₹)', key: 'pendingPayments' },
    ];

    analysis.forEach((item, i) => {
      worksheet.addRow({
        sno: i + 1,
        serviceType: item._id,
        totalComplaints: item.totalComplaints,
        completedComplaints: item.completedComplaints,
        pendingComplaints: item.pendingComplaints,
        totalRevenue: item.totalRevenue,
        pendingPayments: item.pendingPayments,
      });
    });

    styleHeaderRow(worksheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=service_analysis_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export service analysis error:', error.message);
    res.status(500).json({ message: 'Failed to export service analysis' });
  }
};

module.exports = { exportCustomers, exportComplaints, exportServiceAnalysis };
