import React from 'react';
import { Container, Typography, Paper, Box, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function Help() {
  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Help Center
      </Typography>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 1200,
          mx: 'auto',
          mb: 4,
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpOutlineIcon sx={{ fontSize: 30, mr: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h5" color="primary" gutterBottom>
            MoneyMate Help Guide
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" paragraph>
          Welcome to the MoneyMate Help Center. Here you'll find answers to common questions and guidance on how to use the application effectively.
        </Typography>
        
        <Typography variant="h6" sx={{ mt: 2, mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
          Frequently Asked Questions
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I add a new expense?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              To add a new expense, navigate to the Expenses page and click the "Add Expense" button. Fill in the required fields:
              <ul>
                <li><strong>Amount:</strong> Enter the expense amount</li>
                <li><strong>Category:</strong> Select from the dropdown menu</li>
                <li><strong>Date:</strong> Select using the date picker</li>
                <li><strong>Description:</strong> Add details about the expense</li>
                <li><strong>Type:</strong> Choose between "Expense" or "Savings"</li>
              </ul>
              Then click "Save" to record your expense.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I create and manage savings goals?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              To create a savings goal, go to the Savings Goals page and follow these steps:
              <ol>
                <li>Find the "Add Savings Goal" form at the top of the page</li>
                <li>Fill in the required fields:
                  <ul>
                    <li><strong>Name:</strong> Enter a name for your goal</li>
                    <li><strong>Target Amount:</strong> Enter the amount you want to save</li>
                    <li><strong>Deadline:</strong> Select a target date using the date picker</li>
                  </ul>
                </li>
                <li>Click the "Add Goal" button to create your savings goal</li>
              </ol>
              
              <strong>To add money to your savings goal:</strong>
              <ol>
                <li>Go to the Expenses page</li>
                <li>Click the "Add Expense" button to open the form</li>
                <li>Enter the amount you want to save</li>
                <li>Select "Savings" from the Type dropdown menu</li>
                <li>Choose a category (any category can be used with savings type)</li>
                <li>Add a description (optional)</li>
                <li>Select the date</li>
                <li>Click "Save" to record your savings</li>
              </ol>
              <p>The system will automatically add this amount to your total savings balance, which can be used toward any of your savings goals.</p>
              
              <strong>To track your progress:</strong>
              <ul>
                <li>The Savings Goals page displays all your goals with progress bars</li>
                <li>You can see days remaining until your deadline</li>
                <li>Current savings amount and percentage of target are displayed</li>
              </ul>
              
              <strong>To achieve a savings goal:</strong>
              <ul>
                <li>When you've reached your savings goal and want to spend the money:</li>
                <li>Click the "Achieve Goal" button on the goal card</li>
                <li>In the dialog that appears, select a category for the expense</li>
                <li>Add a description of how you spent the money</li>
                <li>Click "Confirm" to mark the goal as achieved</li>
                <li>This will create an expense transaction and remove the goal from your active goals</li>
              </ul>
              
              <strong>To edit or delete a goal:</strong>
              <ul>
                <li>Click the "Edit" button (pencil icon) on a goal card to modify its details</li>
                <li>Click the "Delete" button (trash icon) to remove a goal (confirmation required)</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I add money to my savings?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Adding money to your savings is done through the Expenses page:
              <ol>
                <li>Navigate to the Expenses page</li>
                <li>Click the "Add Expense" button at the top of the page</li>
                <li>In the form that appears:
                  <ul>
                    <li>Enter the amount you want to save</li>
                    <li>Select a date using the date picker</li>
                    <li>Add a description (optional, e.g., "Monthly savings")</li>
                    <li><strong>Important:</strong> Change the "Type" dropdown from "Expense" to "Savings"</li>
                    <li>Select any category from the dropdown (the category helps you track the source of your savings)</li>
                  </ul>
                </li>
                <li>Click the "Save" button to record your savings transaction</li>
              </ol>
              
              <p>When you select "Savings" as the type:</p>
              <ul>
                <li>The transaction amount is added to your total savings balance</li>
                <li>The transaction appears in your expense list with a special savings indicator</li>
                <li>The amount becomes available for all your savings goals</li>
                <li>Your savings progress bars will update automatically</li>
              </ul>
              
              <p><strong>Note:</strong> The system maintains a single savings pool that can be allocated toward any of your goals. You don't need to specify which goal you're saving for when adding a savings transaction.</p>
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I achieve a savings goal?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              When you've reached your savings goal and want to use the money for its intended purpose:
              <ol>
                <li>Go to the Savings Goals page</li>
                <li>Find the goal you want to mark as achieved</li>
                <li>Click the "Achieve Goal" button on that goal's card</li>
                <li>A dialog will appear asking for additional information:
                  <ul>
                    <li><strong>Expense Category:</strong> Select a category that best represents how you spent the money</li>
                    <li><strong>Description:</strong> Enter details about how you used the savings (pre-filled with "Spent savings for: [goal name]")</li>
                  </ul>
                </li>
                <li>Click "Confirm" to complete the process</li>
              </ol>
              
              <p>When you achieve a goal:</p>
              <ul>
                <li>The system creates an expense transaction for the goal amount</li>
                <li>The goal is removed from your active goals list</li>
                <li>Your total savings balance is reduced by the goal amount</li>
                <li>The transaction appears in your expense history with the category and description you provided</li>
              </ul>
              
              <p><strong>Note:</strong> Achieving a goal is different from deleting it. Achieving means you've successfully saved for and spent money on your intended purpose, while deleting simply removes the goal without recording an expense.</p>
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I view my spending by category?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              The Dashboard page displays a pie chart showing your spending by category. You can also view more detailed breakdowns on the Reports page, where you can:
              <ul>
                <li>Filter by date range to analyze spending patterns</li>
                <li>View monthly comparisons of income vs. expenses</li>
                <li>See category-specific spending trends over time</li>
                <li>Identify your highest spending categories</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">How do I update my budget limits?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              To update your budget limits, go to the Budget page. You can:
              <ul>
                <li>Set monthly limits for different spending categories</li>
                <li>View your current spending against each budget category</li>
                <li>See visual indicators when approaching or exceeding budget limits</li>
                <li>Adjust budget allocations as your financial situation changes</li>
              </ul>
              The system will track your spending against these limits and alert you when you're approaching them.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">What are the savings tips for students?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              On the Savings Goals page, you'll find these helpful tips:
              <ul>
                <li>Set realistic goals based on your income and expenses</li>
                <li>Save small amounts regularly rather than large amounts occasionally</li>
                <li>Track your progress to stay motivated</li>
                <li>Use the "Savings" transaction type in the Expenses page to record money you've set aside</li>
                <li>When you spend your savings, use the "Achieve Goal" button to record the expense</li>
              </ul>
              Following these tips can help you develop good saving habits as a student.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
          Getting Support
        </Typography>
        
        <Typography variant="body1" paragraph>
          If you need additional help or have questions not covered here, please contact our support team at <Box component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>support@moneymate.com</Box> or use the feedback form in the application.
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
          MoneyMate v1.0 - Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Paper>
    </Box>
  );
}

export default Help;