import ExcelJS from 'exceljs';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import { getAuthUser, isUserAdmin } from '@/lib/auth';

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

  worksheet.columns.forEach((col) => {
    col.width = Math.max((col.header ? col.header.length : 10) + 6, 15);
  });
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { type } = params;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alka Refrigeration 2.0';
    workbook.created = new Date();

    let filename = 'report.xlsx';

    if (type === 'customers') {
      filename = 'customers_report.xlsx';
      const customers = await User.find({ role: { $ne: 'admin' } })
        .select('-__v -googleId')
        .sort({ createdAt: -1 });

      const worksheet = workbook.addWorksheet('Customers');
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
    } else if (type === 'complaints') {
      filename = 'complaints_report.xlsx';
      const complaints = await Complaint.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

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
          preferredDate: c.preferredDate
            ? new Date(c.preferredDate).toLocaleDateString('en-IN')
            : 'N/A',
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
    } else if (type === 'service-analysis') {
      filename = 'service_analysis_report.xlsx';
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
    } else {
      return new Response(JSON.stringify({ message: 'Invalid report type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export report error:', error);
    return new Response(JSON.stringify({ message: 'Failed to generate report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
